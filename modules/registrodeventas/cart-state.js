/* Estado observable y pequeño del carrito; la UI solo reacciona a sus cambios. */
(function initCartState(global) {
  'use strict';

  let items = [];
  const listeners = new Set();
  const notify = () => listeners.forEach((listener) => listener(getItems()));
  const getItems = () => items.map((item) => ({ ...item }));

  function add(item) {
    const index = items.findIndex((current) => current.productoId === item.productoId);
    if (index >= 0) items[index] = AppSales.updateQuantity(items[index], items[index].cantidad + item.cantidad);
    else items.push({ ...item });
    notify();
  }

  function remove(index) {
    items.splice(index, 1);
    notify();
  }

  function clear() {
    items = [];
    notify();
  }

  global.SalesCart = Object.freeze({
    add,
    remove,
    clear,
    getItems,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
})(window);
