import {
  Attrs,
  AttrsArg,
  IStyledComponent,
  IStyledComponentFactory,
  KnownTarget,
  StyledOptions,
  VariantsArg,
  WebTarget
} from '../types';

import { EMPTY_OBJECT } from '../utils/empties';
import React from 'react';

// import css from "./css";

/**
 * for types a and b, if b shares a field with a, mark a's field as optional
 */
type OptionalIntersection<A, B> = {
  [K in Extract<keyof A, keyof B>]?: A[K];
};

/**
 * If attrs type is a function (no type provided, inferring from usage), extract the return value
 * and merge it with the existing type to hole-punch any required fields that are satisfied as
 * a result of running attrs. Otherwise if we have a definite type then union the base props
 * with the passed attr type to capture any intended overrides.
 */
type MarkPropsSatisfiedByAttrs<
  T extends Attrs,
  Props extends object
> = T extends (...args: any) => infer P
  ? Omit<Props, keyof P> & OptionalIntersection<Props, P>
  : Omit<Props, keyof T> & Partial<T>;

export interface Styled<
  Target extends WebTarget,
  OuterProps extends object = Target extends KnownTarget
    ? React.ComponentPropsWithRef<Target>
    : JSX.IntrinsicElements['div'],
  OuterStatics extends object = object
> {
  <Props extends object = object, Statics extends object = object>(
    baseClassName?: string
  ): IStyledComponent<Target, OuterProps & Props> & OuterStatics & Statics;

  variants: <Variants extends VariantsArg>(
    variants: Variants
  ) => Styled<Target, OuterProps, OuterStatics>;

  attrs: <T extends Attrs>(
    attrs: AttrsArg<
      T extends (...args: any) => infer P ? OuterProps & P : OuterProps & T
    >
  ) => Styled<Target, MarkPropsSatisfiedByAttrs<T, OuterProps>, OuterStatics>;

  withConfig: (
    config: StyledOptions<OuterProps>
  ) => Styled<Target, OuterProps, OuterStatics>;
}

export default function constructWithOptions<
  Target extends WebTarget,
  OuterProps extends object = Target extends KnownTarget
    ? React.ComponentPropsWithRef<Target>
    : JSX.IntrinsicElements['div'],
  OuterStatics extends object = object
>(
  componentConstructor: IStyledComponentFactory<
    Target,
    OuterProps,
    OuterStatics
  >,
  tag: Target,
  options: StyledOptions<OuterProps> = EMPTY_OBJECT
): Styled<Target, OuterProps, OuterStatics> {
  // We trust that the tag is a valid component as long as it isn't falsish
  // Typically the tag here is a string or function (i.e. class or pure function component)
  // However a component may also be an object if it uses another utility, e.g. React.memo
  // React will output an appropriate warning however if the `tag` isn't valid
  if (!tag) {
    throw new Error(`Cannot create styled-component for component: ${tag}`);
  }

  /* This is callable directly as a template function */
  const templateFunction = <
    Props extends object = object,
    Statics extends object = object
  >(
    baseClassName?: string
  ) => componentConstructor<Props, Statics>(tag, options, baseClassName);

  /* Component Variants */
  templateFunction.variants = <Variants extends VariantsArg>(
    variants: Variants
  ) =>
    constructWithOptions<Target, OuterProps, OuterStatics>(
      componentConstructor as unknown as IStyledComponentFactory<
        Target,
        OuterProps,
        OuterStatics
      >,
      tag,
      {
        ...options,
        variants: Array.prototype
          .concat(options.variants, variants)
          .filter(Boolean)
      }
    );

  /* Modify/inject new props at runtime */
  templateFunction.attrs = <T extends Attrs>(
    attrs: AttrsArg<
      T extends (...args: any) => infer P ? OuterProps & P : OuterProps & T
    >
  ) =>
    constructWithOptions<
      Target,
      MarkPropsSatisfiedByAttrs<T, OuterProps>,
      OuterStatics
    >(
      componentConstructor as unknown as IStyledComponentFactory<
        Target,
        MarkPropsSatisfiedByAttrs<T, OuterProps>,
        OuterStatics
      >,
      tag,
      {
        ...options,
        attrs: Array.prototype.concat(options.attrs, attrs).filter(Boolean)
      }
    );

  /**
   * If config methods are called, wrap up a new template function and merge options */
  templateFunction.withConfig = (config: StyledOptions<OuterProps>) =>
    constructWithOptions<Target, OuterProps, OuterStatics>(
      componentConstructor,
      tag,
      {
        ...options,
        ...config
      }
    );

  return templateFunction;
}
