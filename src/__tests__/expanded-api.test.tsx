import TestRenderer from 'react-test-renderer';
import { render } from '@testing-library/react';
import styled from '..';

describe('expanded api', () => {
  describe('displayName', () => {
    it('should be auto-generated if none passed', () => {
      const Comp = styled.div();
      expect(Comp.displayName).toBe('styled.div');
    });

    it('should be attached if supplied', () => {
      const Comp = styled.div.withConfig({ displayName: 'Comp' })();
      expect(Comp.displayName).toBe('Comp');
    });
  });

  describe('componentId', () => {
    it('should be generated as "sc" + hash', () => {
      const Comp = styled.div();
      const Comp2 = styled.div();

      expect(Comp.styledComponentId).toBe('sc-AxirZ');
      expect(TestRenderer.create(<Comp />).toJSON()).toMatchInlineSnapshot(
        `<div />`
      );

      expect(Comp2.styledComponentId).toBe('sc-AxiKw');
      expect(TestRenderer.create(<Comp2 />)).toMatchInlineSnapshot(`<div />`);
    });

    it('should be generated from displayName + hash', () => {
      const Comp = styled.div.withConfig({ displayName: 'Comp' })();
      const Comp2 = styled.div.withConfig({ displayName: 'Comp2' })();

      expect(Comp.styledComponentId).toBe('Comp-pAHXc');
      expect(TestRenderer.create(<Comp />).toJSON()).toMatchInlineSnapshot(
        `<div />`
      );

      expect(Comp2.styledComponentId).toBe('Comp2-jXawMF');
      expect(TestRenderer.create(<Comp2 />)).toMatchInlineSnapshot(`<div />`);
    });

    it('should be attached if passed in', () => {
      const Comp = styled.div.withConfig({ componentId: 'LOLOMG' })();
      const Comp2 = styled.div.withConfig({ componentId: 'OMGLOL' })();

      expect(Comp.styledComponentId).toBe('LOLOMG');
      expect(TestRenderer.create(<Comp />).toJSON()).toMatchInlineSnapshot(
        `<div />`
      );

      expect(Comp2.styledComponentId).toBe('OMGLOL');
      expect(TestRenderer.create(<Comp2 />)).toMatchInlineSnapshot(`<div />`);
    });

    it('should be combined with displayName if both passed in', () => {
      const Comp = styled.div.withConfig({
        displayName: 'Comp',
        componentId: 'LOLOMG'
      })();
      const Comp2 = styled.div.withConfig({
        displayName: 'Comp2',
        componentId: 'OMGLOL'
      })();

      expect(Comp.styledComponentId).toBe('Comp-LOLOMG');
      expect(TestRenderer.create(<Comp />).toJSON()).toMatchInlineSnapshot(
        `<div />`
      );

      expect(Comp2.styledComponentId).toBe('Comp2-OMGLOL');
      expect(TestRenderer.create(<Comp2 />).toJSON()).toMatchInlineSnapshot(
        `<div />`
      );
    });
  });

  describe('chaining', () => {
    it('should merge the options strings', () => {
      const Comp = styled.div
        .withConfig({ componentId: 'id-1' })
        .withConfig({ displayName: 'dn-2' })();

      expect(Comp.displayName).toBe('dn-2');
      expect(TestRenderer.create(<Comp />).toJSON()).toMatchInlineSnapshot(
        `<div />`
      );
    });

    it('should keep the last value passed in when merging', () => {
      const Comp = styled.div
        .withConfig({ displayName: 'dn-2', componentId: 'id-3' })
        .withConfig({ displayName: 'dn-5', componentId: 'id-4' })();

      expect(Comp.displayName).toBe('dn-5');
      expect(TestRenderer.create(<Comp />).toJSON()).toMatchInlineSnapshot(
        `<div />`
      );
    });
  });

  describe('"as" prop', () => {
    it('changes the rendered element type', () => {
      const Comp = styled.div();

      expect(
        TestRenderer.create(<Comp as="span" />).toJSON()
      ).toMatchInlineSnapshot(`<span />`);
    });

    it('changes the rendered element type when used with attrs', () => {
      const Comp = styled.div.attrs(() => ({
        as: 'header'
      }))();

      expect(TestRenderer.create(<Comp />).toJSON()).toMatchInlineSnapshot(
        `<header />`
      );
    });

    it('prefers attrs over props', () => {
      const Comp = styled.div.attrs(() => ({
        as: 'header'
      }))();

      expect(
        TestRenderer.create(<Comp as="span" />).toJSON()
      ).toMatchInlineSnapshot(`<header />`);
    });

    it('works with custom components', () => {
      const Override: React.FC<any> = (props) => <figure {...props} />;
      const Comp = styled.div();

      expect(
        TestRenderer.create(<Comp as={Override} />).toJSON()
      ).toMatchInlineSnapshot(`<figure />`);
    });

    it('transfers all classes that have been applied', () => {
      const Comp = styled.div('foo');

      const Comp2 = styled(Comp)('bar');

      const Comp3 = styled(Comp2)('baz');

      expect(Comp.displayName).toMatchInlineSnapshot(`"styled.div"`);
      expect(Comp2.displayName).toMatchInlineSnapshot(`"Styled(styled.div)"`);
      expect(Comp3.displayName).toMatchInlineSnapshot(
        `"Styled(Styled(styled.div))"`
      );
      expect(TestRenderer.create(<Comp />).toJSON()).toMatchInlineSnapshot(`
        <div
          className="foo"
        />
      `);
      expect(TestRenderer.create(<Comp2 />).toJSON()).toMatchInlineSnapshot(`
        <div
          className="foo bar"
        />
      `);
      expect(TestRenderer.create(<Comp3 as="span" />).toJSON())
        .toMatchInlineSnapshot(`
        <span
          className="foo bar baz"
        />
      `);
    });

    it('"as" prop signature should inform rendered JSX if provided', () => {
      const X = styled.div<{ as?: 'div' | 'button' }>();
      const StyledX = styled(X)();

      TestRenderer.create(
        <>
          <X
            // @ts-expect-error invalid input test
            as="section"
          />
          <StyledX
            // @ts-expect-error invalid input test
            as="section"
          />
        </>
      );
    });
  });
});
