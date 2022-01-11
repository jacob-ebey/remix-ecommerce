describe("cart", () => {
  it("can add to cart", () => {
    cy.clearCookies();
    cy.visit("http://localhost:3000/en/");

    cy.get("[data-testid=cart-count]").should("not.exist");
    cy.get("a[href^='/en/product/']").first().click();
    let options = cy.get("[data-testid=product-option]");
    options.each((option) => {
      cy.wrap(option).find("button").first().click();
      cy.wrap(option).find("button[aria-selected=true]").should("exist");
    });
    cy.get("[data-testid=add-to-cart]").click();
    cy.get("[data-testid=cart-count]").contains("1");
    cy.get("[data-testid=cart-link]").click();
  });

  it("can increment cart item", () => {
    cy.get("[data-testid=increment-cart]").first().click();
    cy.get("[data-testid=cart-count]").contains("2");
  });

  it("can decrement cart item", () => {
    cy.get("[data-testid=decrement-cart]").first().click();
    cy.get("[data-testid=cart-count]").contains("1");
  });

  it("can remove from cart", () => {
    cy.get("[data-testid=remove-from-cart]").first().click();
    cy.get("[data-testid=cart-count]").should("not.exist");
  });
});
