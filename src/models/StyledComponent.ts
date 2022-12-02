import type {
  AnyComponent,
  AttrsArg,
  Dict,
  ExecutionContext,
  ExecutionProps,
  IStyledComponent,
  IStyledComponentFactory,
  IStyledStatics,
  OmitNever,
  StyledOptions,
  VariantsArg,
  WebTarget
} from '../types';
import React, { Ref, createElement } from 'react';

import { EMPTY_ARRAY } from '../utils/empties';
import domElements from '../utils/domElements';
import escape from '../utils/escape';
import generateComponentId from '../utils/generateComponentId';
import generateDisplayName from '../utils/generateDisplayName';
import hoist from '../utils/hoist';
import isStyledComponent from '../utils/isStyledComponent';
import isTag from '../utils/isTag';
import joinStrings from '../utils/joinStrings';
import merge from '../utils/mixinDeep';

const identifiers: { [key: string]: number } = {};

/* We depend on components having unique IDs */
function generateId(displayName?: string, parentComponentId?: string): string {
  const name = typeof displayName !== 'string' ? 'sc' : escape(displayName);
  // Ensure that no displayName can lead to duplicate componentIds
  identifiers[name] = (identifiers[name] || 0) + 1;

  const componentId = `${name}-${generateComponentId(
    name + identifiers[name]
  )}`;

  return parentComponentId
    ? `${parentComponentId}-${componentId}`
    : componentId;
}

function useVariants<T extends object, U extends object>(
  baseClass: string,
  variants: T,
  resolvedAttrs: U
) {
  const classnames: string[] = [baseClass];

  for (const [propName, propValue] of Object.entries(resolvedAttrs)) {
    const typeOf = typeof propValue;

    if (propName in variants) {
      if (typeOf === 'boolean' || typeOf === 'undefined') {
        // @ts-ignore: too much trouble to get the index of this thing properly
        classnames.push(variants[propName].true);
      } else if (typeOf === 'string' || typeOf === 'number') {
        // @ts-ignore: too much trouble to get the index of this thing properly
        classnames.push(variants[propName][propValue]);
      }
    }
  }

  return classnames.filter(Boolean).join(' ');
}

function useStyledComponentImpl<
  Target extends WebTarget,
  Props extends ExecutionProps
>(
  forwardedComponent: IStyledComponent<Target, Props>,
  props: Props,
  forwardedRef: Ref<Element>
) {
  const {
    variants: componentVariants,
    attrs: componentAttrs,
    baseClassName,
    foldedComponentClasses,
    shouldForwardProp,
    target
  } = forwardedComponent;

  const contextVariants = componentVariants.reduce(
    (variants, variantDefinitions) => merge(variants, variantDefinitions),
    {}
  );

  const context = componentAttrs.reduce<
    ExecutionContext &
      Props & { class?: string; className?: string; ref?: React.Ref<Target> }
  >(
    (p, attrDef) => {
      const resolvedAttrDef =
        typeof attrDef === 'function' ? attrDef(p) : attrDef;

      /* eslint-disable guard-for-in */
      for (const key in resolvedAttrDef) {
        // @ts-expect-error bad types
        p[key] =
          key === 'className'
            ? joinStrings(p[key], resolvedAttrDef[key])
            : key === 'style'
            ? { ...p[key], ...resolvedAttrDef[key] }
            : resolvedAttrDef[key];
      }
      /* eslint-enable guard-for-in */

      return p;
    },
    { ...props }
  );

  const generatedClassName = useVariants(
    baseClassName,
    contextVariants,
    context
  );

  const refToForward = forwardedRef;
  const elementToBeCreated: WebTarget = context.as || target;
  const isTargetTag = isTag(elementToBeCreated);
  const propsForElement: Dict<any> = {};

  // eslint-disable-next-line guard-for-in
  for (const key in context) {
    // @ts-expect-error for..in iterates strings instead of keyof
    if (context[key] === undefined || key in contextVariants) {
      // Omit undefined values from props passed to wrapped element.
      // This enables using .attrs() to remove props, for example.
    } else if (key[0] === '$' || key === 'as') {
      // Omit transient props and execution props.
    } else if (key === 'forwardedAs') {
      propsForElement.as = context.forwardedAs;
    } else if (
      !shouldForwardProp ||
      shouldForwardProp(key, elementToBeCreated)
    ) {
      // @ts-expect-error for..in iterates strings instead of keyof
      propsForElement[key] = context[key];
    }
  }

  const componentClassNames = foldedComponentClasses
    .concat(generatedClassName, context.className || '')
    .filter(Boolean)
    .join(' ');

  propsForElement[
    // handle custom elements which React doesn't properly alias
    isTargetTag &&
    domElements.indexOf(
      elementToBeCreated as Extract<typeof domElements, string>
    ) === -1
      ? 'class'
      : 'className'
  ] = componentClassNames.length > 0 ? componentClassNames : undefined;

  propsForElement.ref = refToForward;

  return createElement(elementToBeCreated, propsForElement);
}

function createStyledComponent<
  Target extends WebTarget,
  OuterProps extends object,
  Statics extends object = object
>(
  target: Target,
  options: StyledOptions<OuterProps>,
  baseClassName: string = ''
): ReturnType<IStyledComponentFactory<Target, OuterProps, Statics>> {
  const isTargetStyledComp = isStyledComponent(target);
  const styledComponentTarget = target as IStyledComponent<Target, OuterProps>;
  const isCompositeComponent = !isTag(target);

  const {
    variants = EMPTY_ARRAY,
    attrs = EMPTY_ARRAY,
    componentId = generateId(options.displayName, options.parentComponentId),
    displayName = generateDisplayName(target)
  } = options;

  const styledComponentId =
    options.displayName && options.componentId
      ? `${escape(options.displayName)}-${options.componentId}`
      : options.componentId || componentId;

  // fold the underlying StyledComponent variants up (implicit extend)
  const finalVariants =
    isTargetStyledComp && styledComponentTarget.variants
      ? styledComponentTarget.variants
          .concat(variants as unknown as VariantsArg[])
          .filter(Boolean)
      : (variants as VariantsArg[]);

  // fold the underlying StyledComponent attrs up (implicit extend)
  const finalAttrs =
    isTargetStyledComp && styledComponentTarget.attrs
      ? styledComponentTarget.attrs
          .concat(attrs as unknown as AttrsArg<OuterProps>[])
          .filter(Boolean)
      : (attrs as AttrsArg<OuterProps>[]);

  let { shouldForwardProp } = options;

  if (isTargetStyledComp && styledComponentTarget.shouldForwardProp) {
    const shouldForwardPropFn = styledComponentTarget.shouldForwardProp;

    if (options.shouldForwardProp) {
      const passedShouldForwardPropFn = options.shouldForwardProp;

      // compose nested shouldForwardProp calls
      shouldForwardProp = (prop, elementToBeCreated) =>
        shouldForwardPropFn(prop, elementToBeCreated) &&
        passedShouldForwardPropFn(prop, elementToBeCreated);
    } else {
      shouldForwardProp = shouldForwardPropFn;
    }
  }

  // TODO: not sure what to do here
  // const componentStyle = new ComponentStyle(
  //   rules,
  //   styledComponentId,
  //   isTargetStyledComp
  //     ? (styledComponentTarget.componentStyle as ComponentStyle)
  //     : undefined
  // );

  // // statically styled-components don't need to build an execution context object,
  // // and shouldn't be increasing the number of class names
  // const isStatic = componentStyle.isStatic && attrs.length === 0;
  function forwardRef(props: ExecutionProps & OuterProps, ref: Ref<Element>) {
    // eslint-disable-next-line
    return useStyledComponentImpl<Target, OuterProps>(
      WrappedStyledComponent,
      props,
      ref
    );
  }

  forwardRef.displayName = displayName;

  /**
   * forwardRef creates a new interim component, which we'll take advantage of
   * instead of extending ParentComponent to create _another_ interim class
   */
  const WrappedStyledComponent = React.forwardRef(
    forwardRef
  ) as unknown as IStyledComponent<typeof target, OuterProps> & Statics;
  WrappedStyledComponent.variants = finalVariants;
  WrappedStyledComponent.attrs = finalAttrs;
  WrappedStyledComponent.baseClassName = baseClassName;
  WrappedStyledComponent.displayName = displayName;
  WrappedStyledComponent.shouldForwardProp = shouldForwardProp;

  // this static is used to preserve the cascade of static classes for component selector
  // purposes; this is especially important with usage of the css prop

  WrappedStyledComponent.foldedComponentClasses = isTargetStyledComp
    ? styledComponentTarget.foldedComponentClasses.concat(
        styledComponentTarget.baseClassName
      )
    : (EMPTY_ARRAY as string[]);

  WrappedStyledComponent.styledComponentId = styledComponentId;

  // fold the underlying StyledComponent target up since we folded the styles
  WrappedStyledComponent.target = isTargetStyledComp
    ? styledComponentTarget.target
    : target;

  Object.defineProperty(WrappedStyledComponent, 'defaultProps', {
    get() {
      return this._foldedDefaultProps;
    },

    set(obj) {
      this._foldedDefaultProps = isTargetStyledComp
        ? merge({}, styledComponentTarget.defaultProps, obj)
        : obj;
    }
  });

  /* istanbul ignore next */
  WrappedStyledComponent.toString = () =>
    `.${WrappedStyledComponent.styledComponentId}`;

  if (isCompositeComponent) {
    const compositeComponentTarget = target as AnyComponent;

    hoist<typeof WrappedStyledComponent, typeof compositeComponentTarget>(
      WrappedStyledComponent,
      compositeComponentTarget,
      {
        // all SC-specific things should not be hoisted
        variants: true,
        attrs: true,
        baseClassName: true,
        displayName: true,
        foldedComponentClasses: true,
        shouldForwardProp: true,
        styledComponentId: true,
        target: true
      } as { [key in keyof OmitNever<IStyledStatics<OuterProps>>]: true }
    );
  }

  return WrappedStyledComponent;
}

export default createStyledComponent;
