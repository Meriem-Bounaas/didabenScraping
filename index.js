import puppeteer from "puppeteer";
import { createArrayCsvWriter } from 'csv-writer'

const csvWriter = createArrayCsvWriter({
  header: ['id', 'parent', 'textAr', 'textFr'],
  path: 'categories.csv'
});


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

    function createCategoObject(id, parent, textFr, textAr) {
      return { id, parent, textFr, textAr };
  }

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

  let objects = [];
  CategoriesAr.forEach((item, index) => {
    objects.push([index, -1, CategoriesFr[index][0], item[0]]);
  });

  CategoriesAr.forEach((item, index) => {
    item[1].forEach((sousCatego, ind)=>{
      objects.push([objects.length-1, index, CategoriesFr[index][1][ind],sousCatego]);
    })
  });

  csvWriter
    .writeRecords(objects)
    .then(() => console.log('Le fichier CSV a été créé avec succès'));  

  // Close the browser
  await browser.close();
};

// Start the scraping
getCategories();