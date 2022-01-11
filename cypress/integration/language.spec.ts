describe("language", () => {
  it("defaults to english", () => {
    cy.clearCookies();
    cy.visit("http://localhost:3000/");
    cy.get("html").should("have.attr", "lang", "en");
  });

  it("should have spanish on /es route", () => {
    cy.visit("http://localhost:3000/es/");
    cy.get("html").should("have.attr", "lang", "es");
  });

  it("has spanish after selecting", () => {
    cy.visit("http://localhost:3000/");
    cy.get("html").should("have.attr", "lang", "en");
    cy.get("[data-testid=language-selector]").click();
    cy.get("button[value=es]").click();
    cy.url().should("include", "/es");
    cy.visit("http://localhost:3000/");
    cy.get("html").should("have.attr", "lang", "es");
  });
});
