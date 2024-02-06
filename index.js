import puppeteer from "puppeteer";
import { createArrayCsvWriter } from 'csv-writer'


function writeToCsv(categories, filename) {
  const csvWriter = createArrayCsvWriter({
      header: ['id', 'parent', 'textAr', 'textFr'],
      path: filename + '.csv'
  });

  csvWriter
      .writeRecords(categories)
      .then(() => console.log('Le fichier CSV "' + filename + '.csv" a été créé avec succès'))
      .catch(error => console.error('Une erreur est survenue lors de la création du fichier CSV :', error));
}

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
            const sousCategorie = Array.from(categorie.querySelectorAll('ul > li > ul > li')).map(subcat => subcat.innerText.trim().replace(/\n/g, ',').split(','))
            return [categorieTextFr, sousCategorie[0]];
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
            const sousCatego = Array.from(categorie.querySelectorAll('ul > li > ul > li')).map(subcat => subcat.innerText.trim().replace(/\n/g, ',').split(','))
      
            return [categorieTextAr, sousCatego[0]];
      
        });

        return categoAr
        
  });

  // get product data 
  const productsFr = await page.evaluate(() => {

      const spans = document.querySelectorAll("span");

      spans.forEach(span => {
          if (span.textContent.includes('Produits')) {
            span.click()
          }
      });

      let itemsInfo = []

      const linkItems = document.evaluate( "//div[@class='product-info']/h5/strong/a" ,document, null, XPathResult.ANY_TYPE, null );
      // const hrefItems = linkItems.getAttribute('href')


      // const link = Array.from(hrefItems).map((lien) => {
      //   lien.click()
      //   const category = document.querySelector('span').querySelector('.red')
      //   const reference = document.querySelector('span').querySelector('.green')

      //   itemsInfo.push([category, reference])
      // });

      return linkItems
      
  });

  console.log(productsFr)

  let categories = [];
  CategoriesAr.forEach((item, index) => {
    categories.push([index, -1, CategoriesFr[index][0], item[0]]);
  });

  CategoriesAr.forEach((item, index) => {
    item[1].forEach((sousCatego, ind)=>{
      categories.push([categories.length, index, CategoriesFr[index][1][ind],sousCatego]);
    })
  });

  // csvWriter
  //   .writeRecords(categories, 'categories.csv')
  //   .then(() => console.log('Le fichier CSV a été créé avec succès'));  

  writeToCsv(categories, 'categories')
  // writeToCsv(products, 'products')

  // Close the browser
  await browser.close();
};

// Start the scraping
getCategories();