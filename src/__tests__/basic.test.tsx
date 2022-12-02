import React, { Component, StrictMode } from 'react';

import TestRenderer from 'react-test-renderer';
import { render } from '@testing-library/react';
import styled from '..';

describe('basic', () => {
  it('should not throw an error when called with a valid element', () => {
    expect(() => styled.div()).not.toThrowError();

    const FunctionalComponent = () => <div />;
    class ClassComponent extends Component<any, any> {
      render() {
        return <div />;
      }
    }
    const validComps = ['div' as const, FunctionalComponent, ClassComponent];
    validComps.forEach((comp) => {
      expect(() => {
        const Comp = styled(comp)();
        render(<Comp />);
      }).not.toThrowError();
    });
  });

  it('should throw an error when called without a valid element', () => {
    // @ts-ignore-next-line we want it to throw
    expect(() => styled()).toThrowErrorMatchingInlineSnapshot(
      `"Cannot create styled-component for component: undefined"`
    );
  });

  it('should not inject anything by default', () => {
    // eslint-disable-next-line no-unused-expressions
    const Comp = styled.p();

    const { container } = render(<Comp />);

    expect(container.querySelector('p')).not.toHaveAttribute('class');
  });

  it('should inject styles', () => {
    const Comp = styled.p('blue');

    const { container } = render(<Comp />);

    expect(container.querySelector('p')).toHaveAttribute('class', 'blue');
  });

  it('Should have the correct styled(component) displayName', () => {
    const CompWithoutName = () => (() => <div />) as React.FC<any>;

    const StyledTag = styled.div();
    expect(StyledTag.displayName).toBe('styled.div');

    const CompWithName: React.FC<any> = () => <div />;
    CompWithName.displayName = undefined;
    const StyledCompWithName = styled(CompWithName)();
    expect(StyledCompWithName.displayName).toBe('Styled(CompWithName)');

    const CompWithDisplayName = CompWithoutName();
    CompWithDisplayName.displayName = 'displayName';
    const StyledCompWithDisplayName = styled(CompWithDisplayName)();
    expect(StyledCompWithDisplayName.displayName).toBe('Styled(displayName)');

    const CompWithBoth = () => <div />;
    CompWithBoth.displayName = 'displayName';
    const StyledCompWithBoth = styled(CompWithBoth)();
    expect(StyledCompWithBoth.displayName).toBe('Styled(displayName)');

    const CompWithNothing = CompWithoutName();
    CompWithNothing.displayName = undefined;
    const StyledCompWithNothing = styled(CompWithNothing)();
    expect(StyledCompWithNothing.displayName).toBe('Styled(Component)');
  });

  it('works with the React 16.6 "memo" API', () => {
    // eslint-disable-next-line react/display-name
    const Comp = React.memo((props) => <p {...props} />);
    const StyledComp = styled(Comp)('red');

    const { container } = render(<StyledComp />);

    expect(container.querySelector('p')).toHaveAttribute('class', 'red');
  });

  it('works with custom elements (use class instead of className)', async () => {
    const Comp = styled('custom-element')('red');
    const { findByTestId } = render(<Comp data-testid="Component" />);
    const component = await findByTestId('Component');

    expect(component).toHaveAttribute('class', 'red');
  });

  describe('jsdom', () => {
    class InnerComponent extends Component<any, any> {
      render() {
        return <div {...this.props} />;
      }
    }

    it('should pass the full className to the wrapped child', () => {
      const OuterComponent = styled(InnerComponent)('foo');

      class Wrapper extends Component<any, any> {
        render() {
          return <OuterComponent className="bar" />;
        }
      }

      const { container } = render(<Wrapper />);

      expect(container.querySelector('div>div')).toHaveAttribute(
        'class',
        'foo bar'
      );
    });

    it('should pass the ref to the component', async () => {
      const ref = React.createRef<HTMLParagraphElement>();
      const Comp = styled.p('foo');

      const { container } = render(<Comp ref={ref} />);

      expect(ref.current).toBe(container.firstChild);
    });

    it('should pass the ref to the wrapped styled component', () => {
      class Inner extends React.Component {
        public foo: string = 'bar';

        render() {
          return <p {...this.props} />;
        }
      }

      const ref = React.createRef<InstanceType<typeof Inner>>();

      const Outer = styled(Inner)();

      const { container } = render(<Outer ref={ref} />);

      expect(ref.current?.foo).toBe('bar');
    });

    it('should hoist non-react static properties on styled primitives', () => {
      const Inner = styled.div<{}, { foo: string }>();
      Inner.foo = 'bar';

      const Outer = styled(Inner)();

      expect(Outer).toHaveProperty('foo', 'bar');
    });

    it('should hoist non-react static properties on wrapped components', () => {
      const Inner = styled('div')<{}, { foo: string }>();
      Inner.foo = 'bar';

      const Outer = styled(Inner)();

      expect(Outer).toHaveProperty('foo', 'bar');
    });

    it('should not hoist styled component statics', () => {
      const Inner = styled.div();
      const Outer = styled(Inner)('test');

      expect(Outer.styledComponentId).not.toBe(Inner.styledComponentId);
      expect(Outer.baseClassName).not.toEqual(Inner.baseClassName);
    });

    it('folds defaultProps', () => {
      const Inner = styled.div();

      Inner.defaultProps = {
        style: {
          background: 'blue',
          textAlign: 'center'
        }
      };

      const Outer = styled(Inner)();

      Outer.defaultProps = {
        style: {
          background: 'silver'
        }
      };

      expect(Outer.defaultProps).toMatchInlineSnapshot(`
        {
          "style": {
            "background": "silver",
            "textAlign": "center",
          },
        }
      `);
    });

    it('generates unique classnames when not using babel', () => {
      const Named1 = styled.div.withConfig({ displayName: 'Name' })();

      const Named2 = styled.div.withConfig({ displayName: 'Name' })();

      expect(Named1.styledComponentId).not.toBe(Named2.styledComponentId);
    });

    it('honors a passed componentId', () => {
      const Named1 = styled.div.withConfig({
        componentId: 'foo',
        displayName: 'Name'
      })();

      const Named2 = styled.div.withConfig({
        componentId: 'bar',
        displayName: 'Name'
      })();

      expect(Named1.styledComponentId).toBe('Name-foo');
      expect(Named2.styledComponentId).toBe('Name-bar');
    });

    // this no longer is possible in React 16.6 because
    // of the deprecation of findDOMNode; need to find an alternative
    it('should work in StrictMode without warnings', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const Comp = styled.div();

      TestRenderer.create(
        <StrictMode>
          <Comp />
        </StrictMode>
      );

      expect(spy).not.toHaveBeenCalled();
    });

    // this no longer is possible in React 16.6 because
    // of the deprecation of findDOMNode; need to find an alternative
    it('should work in StrictMode without warnings', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const Comp = styled.div();

      TestRenderer.create(
        <StrictMode>
          <Comp />
        </StrictMode>
      );

      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('css modules', () => {
    it('should compose classes', () => {
      const Inner = styled.div('inner');
      const Outer = styled(Inner)('outer');

      const { container } = render(<Outer />);

      expect(container.firstChild).toHaveAttribute('class', 'inner outer');
    });
  });
});
