import puppeteer from "puppeteer";

const getCategories = async () => {

  // Start a Puppeteer session 
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

  // Open a new page
    const page  = await browser.newPage();
  
  // - open the URL website with Ar langage
    await page.goto("https://didaben.com/produit", {
        waitUntil: "domcontentloaded",
    });

    const CategoriesFr = await page.evaluate(() => {

        const categorieList = document.querySelectorAll(".categorie-bar")

        const categoFr = Array.from(categorieList).map((categorie) => {
            const categorieTextFr = categorie.querySelector("a").innerText;
            const sousCategorie = categorie.querySelectorAll('ul > li > ul >li')
      
            return [categorieTextFr, {sousCategorie}];
        });

        return categoFr
        
  });






    // - open the URL website with Ar langage
    await page.goto("https://didaben.com/produit/changeLang", {
        waitUntil: "domcontentloaded",
    });

    const CategoriesAr = await page.evaluate(() => {

        const categorieList = document.querySelectorAll(".categorie-bar")

        const categoAr = Array.from(categorieList).map((categorie) => {
            const categorieTextAr = categorie.querySelector("a").innerText;
            const sousCatego = categorie.querySelectorAll('ul > li > ul >li')
      
            return [categorieTextAr, {sousCatego}];
      
        });

        return categoAr
        
  });

  console.log(CategoriesFr);
  console.log(CategoriesAr);

  // Close the browser
  await browser.close();
};

// Start the scraping
getCategories();