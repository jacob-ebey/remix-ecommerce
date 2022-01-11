describe("wishlist", () => {
  it("can add to wishlist", () => {
    cy.clearCookies();
    cy.visit("http://localhost:3000/en/");

    cy.get("[data-testid=wishlist-count]").should("not.exist");
    cy.get("[data-testid=add-to-wishlist]").first().click();
    cy.get("[data-testid=wishlist-count]").contains("1");
  });

  it("can increment item in wishlist", () => {
    cy.get("[data-testid=wishlist-link]").click();
    cy.get("[data-testid=increment-wishlist]").first().click();
    cy.get("[data-testid=wishlist-count]").contains("2");
  });

  it("can decrement item in wishlist", () => {
    cy.get("[data-testid=decrement-wishlist]").first().click();
    cy.get("[data-testid=wishlist-count]").contains("1");
  });

  it("can remove item from wishlist", () => {
    cy.get("[data-testid=remove-from-wishlist]").first().click();
    cy.get("[data-testid=wishlist-count]").should("not.exist");
  });

  it("can transfer item to cart", () => {
    cy.clearCookies();
    cy.visit("http://localhost:3000/en/");

    cy.get("[data-testid=wishlist-count]").should("not.exist");
    cy.get("[data-testid=add-to-wishlist]").first().click();
    cy.get("[data-testid=wishlist-count]").contains("1");
    cy.get("[data-testid=wishlist-link]").click();
    cy.get("[data-testid=move-to-cart]").first().click();
    cy.get("[data-testid=wishlist-count]").should("not.exist");
    cy.get("[data-testid=cart-count]").contains("1");
    cy.get("[data-testid=close-wishlist]").click();
  });
});
