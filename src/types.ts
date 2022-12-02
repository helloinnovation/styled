import React from 'react';

export interface ExoticComponentWithDisplayName<P = any>
  extends React.ExoticComponent<P> {
  defaultProps?: Partial<P>;
  displayName?: string;
}

// from https://stackoverflow.com/a/69852402
export type OmitNever<T> = {
  [K in keyof T as T[K] extends never ? never : K]: T[K];
};

export type AnyComponent<P = any> =
  | ExoticComponentWithDisplayName<P>
  | React.ComponentType<P>;

export type KnownTarget = keyof JSX.IntrinsicElements | AnyComponent;

export type WebTarget =
  | string // allow custom elements, etc.
  | KnownTarget;

export type Dict<T> = { [key: string]: T };

export interface ExecutionProps {
  /**
   * Dynamically adjust the rendered component or HTML tag, e.g.
   * ```
   * const StyledButton = styled.button``
   *
   * <StyledButton as="a" href="/foo">
   *   I'm an anchor now
   * </StyledButton>
   * ```
   */
  as?: KnownTarget;
  forwardedAs?: KnownTarget;
}

/**
 * ExecutionProps but with `theme` required.
 */
export interface ExecutionContext extends ExecutionProps {}

export type Variant = Record<string, string>;
export type VariantsArg = Record<string, Variant>;

export type AttrsArg<Props extends object> =
  | (Omit<ExecutionProps, keyof Props> & Props)
  | ((props: Omit<ExecutionContext, keyof Props> & Props) => Partial<Props>);

export type Attrs = object | ((...args: any) => object);

export type NameGenerator = (hash: number) => string;

export interface ShouldForwardProp {
  (prop: string, elementToBeCreated: WebTarget): boolean;
}

export interface StyledOptions<Props extends object> {
  variants?: VariantsArg[];
  attrs?: AttrsArg<Props>[];
  componentId?: string;
  displayName?: string;
  parentComponentId?: string;
  shouldForwardProp?: ShouldForwardProp;
}

export interface CommonStatics<Props extends object> {
  variants: VariantsArg[];
  attrs: AttrsArg<Props>[];
  target: WebTarget;
  shouldForwardProp?: ShouldForwardProp;
}

export interface IStyledStatics<OuterProps extends object>
  extends CommonStatics<OuterProps> {
  baseClassName: string;
  // this is here because we want the uppermost displayName retained in a folding scenario
  foldedComponentClasses: Array<string>;
  inlineStyle: never;
  target: WebTarget;
  styledComponentId: string;
}

/**
 * Used by PolymorphicComponent to define prop override cascading order.
 */
export type PolymorphicComponentProps<
  E extends WebTarget,
  P extends object
> = Omit<
  E extends KnownTarget ? P & Omit<React.ComponentPropsWithRef<E>, keyof P> : P,
  'as'
> & {
  as?: P extends { as?: string | AnyComponent } ? P['as'] : E;
};

/**
 * Remove the function call signature, keeping the additional properties.
 * https://stackoverflow.com/a/62502740/347386
 */
export type OmitSignatures<T> = Pick<T, keyof T>;

/**
 * This type forms the signature for a forwardRef-enabled component that accepts
 * the "as" prop to dynamically change the underlying rendered JSX. The interface will
 * automatically attempt to extract props from the given rendering target to
 * get proper typing for any specialized props in the target component.
 */
export interface PolymorphicComponent<
  P extends object,
  FallbackComponent extends WebTarget
> extends OmitSignatures<React.ForwardRefExoticComponent<P>> {
  <E extends WebTarget = FallbackComponent>(
    props: PolymorphicComponentProps<E, P>
  ): React.ReactElement | null;
}

export interface IStyledComponent<
  Target extends WebTarget,
  Props extends object
> extends PolymorphicComponent<Props, Target>,
    IStyledStatics<Props> {
  defaultProps?: Partial<
    (Target extends KnownTarget
      ? ExecutionProps &
          Omit<React.ComponentProps<Target>, keyof ExecutionProps>
      : ExecutionProps) &
      Props
  >;
  toString: () => string;
}

// corresponds to createStyledComponent
export interface IStyledComponentFactory<
  Target extends WebTarget,
  OuterProps extends object,
  OuterStatics extends object = object
> {
  <Props extends object = object, Statics extends object = object>(
    target: Target,
    options: StyledOptions<OuterProps>,
    baseClassName?: string
  ): IStyledComponent<Target, OuterProps & Props> & OuterStatics & Statics;
}
