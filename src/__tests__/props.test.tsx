import TestRenderer from 'react-test-renderer';
import { render } from '@testing-library/react';
import styled from '..';

describe('props', () => {
  it('should filter out props prefixed with dollar sign (transient props)', () => {
    const Comp = styled((p: any) => <div {...p} />)<{
      $fg?: string;
      fg?: string;
    }>();

    const { container } = render(
      <>
        <Comp $fg="red" />
        <Comp fg="red" />
      </>
    );

    expect(container).toMatchInlineSnapshot(`
      <div>
        <div />
        <div
          fg="red"
        />
      </div>
    `);
  });

  it('should forward the "as" prop if "forwardedAs" is used', () => {
    const Comp = ({ as: Component = 'div', ...props }) => (
      <Component {...props} />
    );

    const Comp2 = styled(Comp)();

    const { container } = render(<Comp2 forwardedAs="button" />);

    expect((container.firstChild as HTMLButtonElement).tagName).toBe('BUTTON');
  });

  describe('shouldForwardProp', () => {
    // NB existing functionality (when `shouldForwardProp` is not set) is tested elsewhere

    it('allows for custom prop filtering for elements', () => {
      const Comp = styled('div').withConfig({
        shouldForwardProp: (prop) => !['filterThis'].includes(prop)
      })<{ filterThis: string; passThru: string }>('foo');

      const wrapper = TestRenderer.create(
        <Comp filterThis="abc" passThru="def" />
      );

      const { props } = wrapper.root.findByType('div');
      expect(wrapper.toJSON()).toMatchInlineSnapshot(`
        <div
          className="foo"
          passThru="def"
        />
      `);
      expect(props.passThru).toBe('def');
      expect(props.filterThis).toBeUndefined();
    });

    it('allows custom prop filtering for components', () => {
      const InnerComp = (props: JSX.IntrinsicElements['div']) => (
        <div {...props} />
      );
      const Comp = styled(InnerComp).withConfig({
        shouldForwardProp: (prop) => !['filterThis'].includes(prop)
      })<{ filterThis: string; passThru: string }>('foo');

      const wrapper = TestRenderer.create(
        <Comp filterThis="abc" passThru="def" />
      );

      const { props } = wrapper.root.findByType('div');

      expect(wrapper.toJSON()).toMatchInlineSnapshot(`
        <div
          className="foo"
          passThru="def"
        />
      `);

      expect(props.passThru).toBe('def');
      expect(props.filterThis).toBeUndefined();
    });

    it('composes shouldForwardProp on composed styled components', () => {
      const StyledDiv = styled('div').withConfig({
        shouldForwardProp: (prop) => prop === 'passThru'
      })<{ filterThis: boolean; passThru: boolean }>('foo');
      const ComposedDiv = styled(StyledDiv).withConfig({
        shouldForwardProp: () => true
      })();

      const wrapper = TestRenderer.create(<ComposedDiv filterThis passThru />);

      const { props } = wrapper.root.findByType('div');

      expect(props.passThru).toBeDefined();
      expect(props.filterThis).toBeUndefined();
    });

    it('should inherit shouldForwardProp for wrapped styled components', () => {
      const Div1 = styled('div').withConfig({
        shouldForwardProp: (prop) => prop !== 'color'
      })<{ color: string }>();

      const Div2 = styled(Div1)();

      const wrapper = TestRenderer.create(
        <>
          <Div1 color="red" id="test-1" />
          <Div2 color="green" id="test-2" />
        </>
      );

      expect(wrapper.toJSON()).toMatchInlineSnapshot(`
        [
          <div
            id="test-1"
          />,
          <div
            id="test-2"
          />,
        ]
      `);
    });

    it('should filter out props when using "as" to a custom component', () => {
      const AsComp = (props: JSX.IntrinsicElements['div']) => (
        <div {...props} />
      );
      const Comp = styled('div').withConfig({
        shouldForwardProp: (prop) => !['filterThis'].includes(prop)
      })<{ filterThis: string; passThru: string }>();

      const wrapper = TestRenderer.create(
        <Comp as={AsComp} filterThis="abc" passThru="def" />
      );

      const { props } = wrapper.root.findByType(AsComp);

      expect(props.passThru).toBe('def');
      expect(props.filterThis).toBeUndefined();
    });

    it('should filter our props when using "as" to a different element', () => {
      const Comp = styled('div').withConfig({
        shouldForwardProp: (prop) => !['filterThis'].includes(prop)
      })<{ filterThis: string; passThru: string }>();

      const wrapper = TestRenderer.create(
        <Comp as="a" filterThis="abc" passThru="def" />
      );

      const { props } = wrapper.root.findByType('a');

      expect(props.passThru).toBe('def');
      expect(props.filterThis).toBeUndefined();
    });

    it('passes the target element for use if desired', () => {
      const stub = jest.fn();

      const Comp = styled('div').withConfig({
        shouldForwardProp: stub
      })<{ filterThis: string; passThru: string }>();

      TestRenderer.create(
        <Comp as="a" href="/foo" filterThis="abc" passThru="def" />
      );

      expect(stub).toHaveBeenCalledWith('filterThis', 'a');
      expect(stub).toHaveBeenCalledWith('href', 'a');
    });
  });
});
