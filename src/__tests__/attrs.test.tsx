import { AnyComponent } from '../types';
import { Component } from 'react';
import { render } from '@testing-library/react';
import styled from '..';

describe('attrs', () => {
  it('work fine with an empty object', () => {
    const Comp = styled.div.attrs({})();

    const { container } = render(<Comp />);

    expect(container.firstChild).toMatchInlineSnapshot('<div />');
  });

  it('work fine with a function that returns an empty object', () => {
    const Comp = styled.div.attrs(() => ({}))();

    const { container } = render(<Comp />);

    expect(container.firstChild).toMatchInlineSnapshot('<div />');
  });

  it('pass a simple attr via object', () => {
    const Comp = styled.button.attrs({
      type: 'button'
    })();

    const { container } = render(<Comp />);

    expect(container.querySelector('button')).toHaveAttribute('type', 'button');
  });

  it('pass a simple attr via function with object return', () => {
    const Comp = styled.button.attrs(() => ({
      type: 'button'
    }))();

    const { container } = render(<Comp />);

    expect(container.querySelector('button')).toHaveAttribute('type', 'button');
  });

  it('pass a React component', () => {
    class ReactComponent extends Component {
      render() {
        return <p>React Component</p>;
      }
    }

    const Button = ({
      component: ChildComponent
    }: {
      component: AnyComponent;
    }) => (
      <button>
        <ChildComponent />
      </button>
    );

    const Comp = styled(Button).attrs(() => ({
      component: ReactComponent
    }))();

    const { container } = render(<Comp />);

    expect(container.querySelector('p')).toHaveTextContent('React Component');
  });

  // it('should not call a function passed to attrs as an object value', () => {
  //   const stub = jest.fn(() => 'div');

  //   const Comp = styled.button.attrs(() => ({
  //     foo: stub
  //   }))();

  //   const { container } = render(<Comp />);

  //   expect(stub).not.toHaveBeenCalled();
  // });

  it('defaultProps are merged into what function attrs receives', () => {
    const Comp = styled.button.attrs((props) => ({
      color: props['color'] ?? '#000'
    }))();

    Comp.defaultProps = {
      color: 'red'
    };

    const { asFragment } = render(<Comp />);

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <button
          color="red"
        />
      </DocumentFragment>
    `);
  });

  it('pass props to the attr function', () => {
    const Comp = styled.button.attrs<{ $submit?: boolean }>((p) => ({
      type: p.$submit ? 'submit' : 'button'
    }))();

    const { container: button } = render(<Comp />);
    const { container: submitButton } = render(<Comp $submit />);

    expect(button.querySelector('button')).toHaveAttribute('type', 'button');
    expect(submitButton.querySelector('button')).toHaveAttribute(
      'type',
      'submit'
    );
  });

  it('should replace props with attrs', () => {
    const Comp = styled.button.attrs<{ $submit?: boolean }>((p) => ({
      type: p.$submit ? 'submit' : 'button',
      tabIndex: 0
    }))();

    const { container: emptyButtonWrap } = render(<Comp />);
    const { container: resetButtonWrap } = render(<Comp type="reset" />);
    const { container: resetButtonWithTabIndexWrap } = render(
      <Comp type="reset" tabIndex={-1} />
    );

    const emptyButton = emptyButtonWrap.querySelector('button');
    const resetButton = resetButtonWrap.querySelector('button');
    const resetButtonWithTabIndex =
      resetButtonWithTabIndexWrap.querySelector('button');

    expect(emptyButton).toHaveAttribute('type', 'button');
    expect(emptyButton).toHaveAttribute('tabindex', '0');

    expect(resetButton).toHaveAttribute('type', 'button');
    expect(resetButton).toHaveAttribute('tabindex', '0');

    expect(resetButtonWithTabIndex).toHaveAttribute('type', 'button');
    expect(resetButtonWithTabIndex).toHaveAttribute('tabindex', '0');
  });

  it('should merge className', () => {
    const Comp = styled.div.attrs(() => ({
      className: 'bar baz'
    }))('foo');

    const { container } = render(<Comp />);

    expect(container.querySelector('div > div')).toHaveAttribute(
      'class',
      'foo bar baz'
    );
  });

  it('should merge className from folded attrs', () => {
    const Inner = styled.div.attrs({ className: 'foo' })();

    const Comp = styled(Inner).attrs(() => ({
      className: 'bar baz'
    }))();

    const { container } = render(<Comp />);

    expect(container.querySelector('div > div')).toHaveAttribute(
      'class',
      'foo bar baz'
    );
  });

  it('should merge className even if its a function', () => {
    const Comp = styled.div.attrs<{ $baz?: boolean }>((p) => ({
      className: `foo ${p.$baz ? 'baz' : 'bar'}`
    }))();

    const { container: comp } = render(<Comp />);
    const { container: compWithParams } = render(<Comp $baz />);

    expect(comp.querySelector('div > div')).toHaveAttribute('class', 'foo bar');
    expect(compWithParams.querySelector('div > div')).toHaveAttribute(
      'class',
      'foo baz'
    );
  });

  it('should merge style', () => {
    const Comp = styled.div.attrs(() => ({
      style: { color: 'red', background: 'blue' }
    }))();

    const { asFragment } = render(
      <Comp style={{ color: 'green', borderStyle: 'dotted' }} />
    );

    expect(asFragment()).toMatchInlineSnapshot(`
      <DocumentFragment>
        <div
          style="color: red; border-style: dotted; background: blue;"
        />
      </DocumentFragment>
    `);
  });

  it('should work with data and aria attributes', async () => {
    const Comp = styled.div.attrs(() => ({
      'data-testid': 'myElement',
      'data-foo': 'bar',
      'aria-label': 'A simple FooBar'
    }))();

    const { findByTestId } = render(<Comp />);
    const div = await findByTestId('myElement');

    expect(div).toHaveAttribute('data-foo', 'bar');
    expect(div).toHaveAttribute('aria-label', 'A simple FooBar');
  });

  it('merge attrs', () => {
    const Comp = styled.button
      .attrs(() => ({
        type: 'button',
        tabIndex: 0
      }))
      .attrs(() => ({
        type: 'submit'
      }))();

    const { container } = render(<Comp />);
    const button = container.querySelector('button');

    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('tabindex', '0');
  });

  it('merge attrs when inheriting SC', () => {
    const Parent = styled.button.attrs(() => ({
      type: 'button',
      tabIndex: 0
    }))();

    const Child = styled(Parent).attrs(() => ({
      type: 'submit'
    }))();

    const { container } = render(<Child />);
    const childButton = container.querySelector('button');

    expect(childButton).toHaveAttribute('type', 'submit');
    expect(childButton).toHaveAttribute('tabindex', '0');
  });

  it('should pass through children as a normal prop', async () => {
    const text = 'Probably a bad idea';

    const Comp = styled.div.attrs(() => ({
      children: text
    }))();

    const { findByTestId } = render(<Comp data-testid="comp" />);
    const component = await findByTestId('comp');

    expect(component).toHaveTextContent(text);
  });

  it('should pass through complex children as well', () => {
    const Comp = styled.p.attrs(() => ({
      children: <span>Probably a bad idea</span>
    }))();

    const { container } = render(<Comp />);
    const component = container.querySelector('p');

    expect(component).toContainHTML('<span>Probably a bad idea</span>');
  });

  it('should override children of course', () => {
    const Comp = styled.p.attrs(() => ({
      children: <span>Amazing</span>
    }))();

    const { container } = render(
      <Comp>
        <span>Something else</span>
      </Comp>
    );

    const component = container.querySelector('p');
    expect(component).toContainHTML('<span>Amazing</span>');
  });

  it('should shallow merge "style" prop + attr instead of overwriting', () => {
    const Paragraph = styled.p.attrs<{ $fontScale?: number }>((p) => ({
      style: {
        ...p.style,
        fontSize: `${p.$fontScale}em`
      }
    }))();

    class Text extends Component<
      Partial<React.ComponentProps<typeof Paragraph>>,
      { fontScale: number }
    > {
      state = {
        // Assume that will be changed automatically
        // according to the dimensions of the container
        fontScale: 4
      };

      render() {
        return (
          <Paragraph $fontScale={this.state.fontScale} {...this.props}>
            {this.props.children}
          </Paragraph>
        );
      }
    }

    const BlueText = styled(Text).attrs(() => ({
      style: {
        color: 'blue'
      }
    }))();

    const { container } = render(<BlueText>Hello</BlueText>);
    const paragraph = container.querySelector('p');

    expect(paragraph).toHaveAttribute('style', 'color: blue; font-size: 4em;');
  });
});
