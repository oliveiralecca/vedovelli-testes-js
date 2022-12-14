/*
 * (3) Introdução aos testes
 *    -> Pelo TDD (Test-driven development), devemos começar as implementações sempre pelos testes
 *      - o próximo passo é ver o teste falhar, ler as falhas e implementar o necessário para que o teste passe
 *    -> Para rodar algum trecho de código antes de cada teste => beforeEach()
 *    -> Para rodar apenas um caso de teste e pular os demais, escreve-se => fit() ao invés de it()
 *    -> Um describe() pode vir dentro de outro a fim de organizar os testes em blocos
 *    -> Quando o retorno de uma função é um objeto grande, por exemplo, para que não seja preciso digitar todo o retorno esperado no .toEqual(), existe um método próprio do jest que faz isso para nós => .toMatchInlineSnapshot()
 *    -> Para obter a mesma funcionalidade acima, porém, sem "sujar" o arquivo de teste com um retorno grande, existe um outro tipo de snapshot que cria um arquivo só para isso => .toMatchSnapshot()
 */

import { Cart } from './Cart';

describe('Cart', () => {
  let cart;
  let productA = {
    title: 'Adidas running shoes - men',
    price: 35388, // 353.88 | R$ 353,88
  };
  let productB = {
    title: 'Adidas running shoes - women',
    price: 41872, // 418.72 | R$ 418,72
  };

  beforeEach(() => {
    cart = new Cart();
  });

  describe('getTotal()', () => {
    it('should return 0 when getTotal() is executed in newly created instance', () => {
      expect(cart.getTotal().getAmount()).toEqual(0);
    });

    it('should multiply quantity and price and receive the total amount', () => {
      const item = {
        product: productA,
        quantity: 2, // 70776
      };

      cart.add(item);

      expect(cart.getTotal().getAmount()).toEqual(70776);
    });

    it('should ensure no more than on product exists at a time', () => {
      cart.add({
        product: productA,
        quantity: 2,
      });

      cart.add({
        product: productA,
        quantity: 1,
      });

      expect(cart.getTotal().getAmount()).toEqual(35388);
    });

    it('should update total when a product gets included and then removed', () => {
      cart.add({
        product: productA,
        quantity: 2,
      });

      cart.add({
        product: productB,
        quantity: 1,
      });

      cart.remove(productA);

      expect(cart.getTotal().getAmount()).toEqual(41872);
    });
  });

  describe('checkout()', () => {
    it('should return an object with the total and the list of items', () => {
      cart.add({
        product: productA,
        quantity: 2,
      });

      cart.add({
        product: productB,
        quantity: 3,
      });

      expect(cart.checkout()).toMatchSnapshot();
    });

    it('should return an object with the total and the list of items when summary() is called', () => {
      cart.add({
        product: productA,
        quantity: 5,
      });

      cart.add({
        product: productB,
        quantity: 3,
      });

      expect(cart.summary()).toMatchSnapshot();
      expect(cart.getTotal().getAmount()).toBeGreaterThan(0);
    });

    it('should include formatted amount in the summary', () => {
      cart.add({
        product: productA,
        quantity: 5,
      });

      cart.add({
        product: productB,
        quantity: 3,
      });

      expect(cart.summary().formatted).toEqual('R$3,025.56');
    });

    it('should reset the cart when checkout() is called', () => {
      cart.add({
        product: productB,
        quantity: 3,
      });

      cart.checkout();

      expect(cart.getTotal().getAmount()).toEqual(0);
    });
  });

  describe('special conditions', () => {
    it('should apply percentage discount when quantity above minimum is passed', () => {
      const condition = {
        percentage: 30,
        minimum: 2,
      };

      cart.add({
        product: productA,
        condition,
        quantity: 3,
      });

      expect(cart.getTotal().getAmount()).toEqual(74315);
    });

    it('should apply quantity discount for even quantities', () => {
      const condition = {
        quantity: 2,
      };

      cart.add({
        product: productA,
        condition,
        quantity: 4,
      });

      expect(cart.getTotal().getAmount()).toEqual(70776);
    });

    it('should apply quantity discount for odd quantities', () => {
      const condition = {
        quantity: 2,
      };

      cart.add({
        product: productA,
        condition,
        quantity: 5,
      });

      expect(cart.getTotal().getAmount()).toEqual(106164);
    });

    it('should NOT apply percentage discount when quantity is below or equals minimum', () => {
      const condition = {
        percentage: 30,
        minimum: 2,
      };

      cart.add({
        product: productA,
        condition,
        quantity: 2,
      });

      expect(cart.getTotal().getAmount()).toEqual(70776);
    });

    it('should NOT apply quantity discount for even quantities when condition is not met', () => {
      const condition = {
        quantity: 2,
      };

      cart.add({
        product: productA,
        condition,
        quantity: 1,
      });

      expect(cart.getTotal().getAmount()).toEqual(35388);
    });

    it('should receive two or more conditions and determine/apply the best discount. First case.', () => {
      const condition1 = {
        percentage: 30, // desconto de no máximo 30%
        minimum: 2,
      };

      const condition2 = {
        quantity: 2, // 40% de desconto (ímpar), 50% de desconto (par) => melhor condição
      };

      cart.add({
        product: productA,
        condition: [condition1, condition2],
        quantity: 5,
      });

      expect(cart.getTotal().getAmount()).toEqual(106164);
    });

    it('should receive two or more conditions and determine/apply the best discount. Second case.', () => {
      const condition1 = {
        percentage: 80, // desconto de 80% => agora é a melhor condição
        minimum: 2,
      };

      const condition2 = {
        quantity: 2, // 40% de desconto (ímpar), 50% de desconto (par) 
      };

      cart.add({
        product: productA,
        condition: [condition1, condition2],
        quantity: 5,
      });

      expect(cart.getTotal().getAmount()).toEqual(35388);
    });
  });
});
