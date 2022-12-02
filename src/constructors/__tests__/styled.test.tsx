import domElements from '../../utils/domElements';
import styled from '../styled';

describe('styled', () => {
  it('should have all valid HTML5 elements defined as properties', () => {
    domElements.forEach((domElement) => {
      expect(styled[domElement]).toBeTruthy();
    });
  });

  // it('Base Class Name should be applied', () => {
  //   const Button = styled.button('custom-class');

  //   const { container } = render(<Button />);
  //   expect(container.querySelector('button')).toHaveClass('custom-class');
  // });

  // it('Should create a styled component without base class name', () => {
  //   const Button = styled.button();

  //   const { container } = render(<Button />);
  //   expect(container.querySelector('button')).toBe(1);
  // });
});
