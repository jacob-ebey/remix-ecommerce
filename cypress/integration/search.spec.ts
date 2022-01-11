describe("search", () => {
  it("works on desktop from landing page", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:3000/en");
    cy.get("[data-testid=search-input]").type("shirt");
    cy.get("[data-testid=search-input]").type("{enter}");
    cy.get("[data-testid=search-results-label]").contains(`"shirt"`);
  });

  it("works on mobile from landing page", () => {
    cy.viewport("iphone-6");
    cy.visit("http://localhost:3000/en");
    cy.get("[data-testid=mobile-search-input]").type("shirt");
    cy.get("[data-testid=mobile-search-input]").type("{enter}");
    cy.get("[data-testid=search-results-label]").contains(`"shirt"`);
  });

  it("can filter results further on desktop", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:3000/en/search?q=shirt");
    cy.get("[data-testid=sort-by-link]").first().click();
    cy.url().should("include", "q=shirt");
    cy.url().should("include", "sort=");
  });

  it("can filter results further on mobile", () => {
    cy.viewport("iphone-6");
    cy.visit("http://localhost:3000/en/search?q=shirt");
    cy.get("[data-testid=sort-by-select]").select(0);
    cy.url().should("include", "q=shirt");
    cy.url().should("include", "sort=");
  });

  it("selecting a category removes query on desktop", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:3000/en/search?q=shirt");
    cy.get("[data-testid=category-link]").first().click();
    cy.url().should("not.include", "q=shirt");
    cy.url().should("include", "category=");
  });

  it("selecting a category removes query on mobile", () => {
    cy.viewport("iphone-6");
    cy.visit("http://localhost:3000/en/search?q=shirt");
    cy.get("[data-testid=category-select]").select(0);
    cy.url().should("not.include", "q=shirt");
    cy.url().should("include", "category=");
  });

  it("can sort category on desktop", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:3000/en/search");
    cy.get("[data-testid=category-link]").first().click();
    cy.get("[data-testid=sort-by-link]").first().click();
    cy.url().should("include", "category=");
    cy.url().should("include", "sort=");
  });

  it("can sort category on mobile", () => {
    cy.viewport("iphone-6");
    cy.visit("http://localhost:3000/en/search");
    cy.get("[data-testid=category-select]").select(0);
    cy.get("[data-testid=sort-by-select]").select(0);
    cy.url().should("include", "category=");
    cy.url().should("include", "sort=");
  });

  it("another search clears query string on desktop", () => {
    cy.viewport("macbook-16");
    cy.visit("http://localhost:3000/en/search");
    cy.get("[data-testid=category-link]").first().click();
    cy.get("[data-testid=sort-by-link]").first().click();
    cy.url().should("include", "category=");
    cy.url().should("include", "sort=");
    cy.get("[data-testid=search-input]").type("shirt");
    cy.get("[data-testid=search-input]").type("{enter}");
    cy.get("[data-testid=search-results-label]").contains(`"shirt"`);
    cy.url().should("not.include", "category=");
    cy.url().should("not.include", "sort=");
    cy.url().should("include", "q=shirt");
  });

  it("another search clears query string on mobile", () => {
    cy.viewport("iphone-6");
    cy.visit("http://localhost:3000/en/search");
    cy.get("[data-testid=category-select]").select(0);
    cy.get("[data-testid=sort-by-select]").select(0);
    cy.url().should("include", "category=");
    cy.url().should("include", "sort=");
    cy.get("[data-testid=mobile-search-input]").type("shirt");
    cy.get("[data-testid=mobile-search-input]").type("{enter}");
    cy.get("[data-testid=search-results-label]").contains(`"shirt"`);
    cy.url().should("not.include", "category=");
    cy.url().should("not.include", "sort=");
    cy.url().should("include", "q=shirt");
  });
});
