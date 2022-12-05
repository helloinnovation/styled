import { IStyledComponent } from '../types';
import { render } from '@testing-library/react';
import styled from '..';

describe('variants', () => {
  it('work fine with an empty object', () => {
    const Comp = styled.div.variants({})();

    const { container } = render(<Comp />);

    expect(container.firstChild).toMatchInlineSnapshot('<div />');
  });

  it('pass a simple variant via object', () => {
    const Comp = styled.button.variants({
      size: {
        small: 'small',
        big: 'big'
      }
    })<{ size: 'small' | 'big' }>();

    const { container } = render(<Comp size="big" />);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('class', 'big');
  });

  it('defaultProps can set a default variant', () => {
    const Comp = styled.button.variants({
      size: {
        small: 'small',
        big: 'big'
      }
    })<{ size?: 'small' | 'big' }>();

    Comp.defaultProps = {
      size: 'big'
    };

    const { container } = render(<Comp />);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('class', 'big');
  });

  it('attrs can set a variant', () => {
    const Comp = styled.button
      .attrs({
        size: 'big'
      })
      .variants({
        size: {
          small: 'small',
          big: 'big'
        }
      })<{ size?: 'small' | 'big' }>();

    const { container } = render(<Comp />);

    const button = container.querySelector('button');
    expect(button).toHaveAttribute('class', 'big');
  });

  it('works with base class', () => {
    const Comp = styled.button.variants({
      size: {
        small: 'small',
        big: 'big'
      }
    })<{ size?: 'small' | 'big' }>('btn');

    const { container } = render(<Comp size="big" />);

    const button = container.querySelector('button');
    expect(button).toHaveAttribute('class', 'btn big');
  });

  it('works with boolean attributes', () => {
    const Comp = styled.button.variants({
      outlined: {
        true: 'outlined'
      }
    })<{ outlined?: boolean }>();

    const { container: defaultcontainer } = render(<Comp />);
    const { container: outlinedFalseContainer } = render(
      <Comp outlined={false} />
    );
    const { container: outlinedContainer } = render(<Comp outlined />);

    const defaultButton = defaultcontainer.querySelector('button');
    expect(defaultButton).not.toHaveAttribute('class', 'outlined');

    const outlinedFalseButton = outlinedFalseContainer.querySelector('button');
    expect(outlinedFalseButton).not.toHaveAttribute('class', 'outlined');

    const outlinedButton = outlinedContainer.querySelector('button');
    expect(outlinedButton).toHaveAttribute('class', 'outlined');
  });

  it('works with number attributes', () => {
    const Comp = styled.button.variants({
      borderWidth: {
        2: 'small',
        3: 'medium'
      }
    })<{ borderWidth?: 2 | 3 }>();

    const { container } = render(<Comp borderWidth={2} />);

    const button = container.querySelector('button');
    expect(button).toHaveAttribute('class', 'small');
  });

  it('extends another variants object properly', () => {
    const BaseButton = styled.button.variants({
      size: {
        small: 'small',
        big: 'big'
      }
    })<{ size: 'small' | 'big' }>();

    const Button = styled(BaseButton).variants({
      outlined: {
        true: 'outlined'
      }
    })<{ outlined?: boolean }>();

    const { container } = render(<Button size="big" outlined />);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('class', 'big outlined');
  });

  it('extends a variant object with a new value properly', () => {
    const BaseButton = styled.button.variants({
      size: {
        small: 'small',
        big: 'big'
      }
    })<{ size: 'small' | 'big' }>();

    interface ButtonProps
      extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      size?: 'small' | 'medium' | 'big';
    }

    const Button = styled(
      BaseButton as IStyledComponent<'button', ButtonProps>
    ).variants({
      size: {
        medium: 'medium'
      }
    })<ButtonProps>();

    const { container } = render(<Button size="medium" />);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('class', 'medium');
  });

  it('does not add the variant attribute to DOM node', () => {
    const Comp = styled.button.variants({
      size: {
        small: 'small',
        big: 'big'
      }
    })<{ size: 'small' | 'big' }>();

    const { container } = render(<Comp size="big" />);
    const button = container.querySelector('button');
    expect(button).not.toHaveAttribute('size');
  });
});
