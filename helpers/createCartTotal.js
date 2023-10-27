async function calculateCartTotal(writableResult) {
  let productTotal = 0;
  let addOnTotal = 0;
  let discountedPrice = 0; //calculate price
  let taxAmount = 0;
  let discountingPrice = 0;
  await writableResult?.products.forEach((product) => {
    // console.log({ product });

    if (product.product.discount.discountType === "flat") {
      discountingPrice += product.product.discount.discountValue;
      // taxAmount += Number(
      //   product.product.tax?.map((tax) => {
      //     return Number(
      //       (Number(tax.taxValue) *
      //         (Number(product.product.initialPrice) -
      //           Number(product.product.discount.discountValue))) /
      //         100
      //     );
      //   })
      // );
    } else if (product.product.discount.discountType === "percentage") {
      discountingPrice +=
        (product.product.initialPrice *
          product.product.discount.discountValue) /
        100;
      // taxAmount += Number(
      //   product.product.tax?.map((tax) => {
      //     return Number(
      //       Number(tax.taxValue) *
      //         ((Number(product.product.initialPrice) -
      //           (Number(product.product.initialPrice) *
      //             Number(product.product.discount.discountValue)) /
      //             100) /
      //           100)
      //     );
      //   })
      // );
    }

    discountedPrice += product.product.finalPrice * product.quantity;
    productTotal += product.product.initialPrice * product.quantity;
    product.addOns.forEach((addOn) => {
      discountedPrice += addOn.addOn.finalPrice * addOn.quantity;
      addOnTotal += addOn.addOn.initialPrice * addOn.quantity;
    });
  });
  addOnTotal = parseFloat(addOnTotal.toFixed(2));
  productTotal = parseFloat(productTotal.toFixed(2));
  discountedPrice = parseFloat(discountedPrice.toFixed(2));
  taxAmount = parseFloat(taxAmount.toFixed(2));
  discountingPrice = parseFloat(discountingPrice.toFixed(2));
  return {
    addOnTotal,
    productTotal,
    discountedPrice,
    taxAmount,
    discountingPrice,
    taxAmount,
  };
}
export { calculateCartTotal };

//TODO replicate this everywhere
