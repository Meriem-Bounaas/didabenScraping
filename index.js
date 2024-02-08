import puppeteer from "puppeteer";
import { createArrayCsvWriter } from 'csv-writer'


function writeToCsv(data, header, filename) {
  const csvWriter = createArrayCsvWriter({
      header: header,
      path: filename + '.csv'
  });

  csvWriter
      .writeRecords(data)
      .then(() => console.log('Le fichier CSV "' + filename + '.csv" a été créé avec succès'))
      .catch(error => console.error('Une erreur est survenue lors de la création du fichier CSV :', error));
}


const getData = async () => {

  // Start a Puppeteer session 
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });

  // Open a new page
    const page  = await browser.newPage();
  
  // open the URL website with Ar langage
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

  // open the URL website with Fr langage
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

  page.on('console', msg => console.log('CLIENT LOG:', msg.text()));  // pour afficher les logs qui ont dedans evaluate  
  
  // open the Products URL website 
  const productPage  = await browser.newPage();
  let productLinks = []
  for (let index = 1; index < 73; index++) {
    await productPage.goto(`https://didaben.com/produit/rechCatigoSplit/?ser=zafikor&page=${index}`, {
      waitUntil: "domcontentloaded",
    });
    // get links products
    const itemLinks = await productPage.evaluate(() => {
        let links = []
        const linkItems = document.querySelectorAll( "div.product-info h5 strong a")
        linkItems.forEach(span => {
            links.push(`https://didaben.com${span.getAttribute("href")}`);
        });
        
       return links      
    });

    productLinks = [...productLinks,...itemLinks]
  }

// open Product detail's URL  
  const detailProduct  = await browser.newPage();
  let infoItems = []
  for (let index = 0; index < productLinks.length; index++) {

    await detailProduct.goto(productLinks[index], {
      waitUntil: "domcontentloaded",
    });

    const infoItem = await detailProduct.evaluate(() => {
      let infos = []
      const titreFr = document.querySelector('div.col-lg-4.col-md-4.col-sm-4.product-single-info.full-size h2').innerText
      const categoryFr = document.querySelector('span.red').innerText
      const refererence = document.querySelector('span.green').innerText
      const niveau = document.querySelector('div.col-lg-4.col-md-4.col-sm-4.product-single-info.full-size table tbody tr:nth-of-type(3) td:nth-of-type(2)').innerText
      const prix = document.querySelector('div.col-lg-4.col-md-4.col-sm-4.product-single-info.full-size span.price').innerText.replace(/,/g, '.')
      const description = document.querySelector('#style-15')? document.querySelector('#style-15').innerText.replace(/,/g, ';') : ' '
      const image = document.querySelector('a.fullscreen-button')? document.querySelector('a.fullscreen-button').getAttribute('href') : ' '

      infos.push([titreFr, categoryFr, refererence, niveau, prix, image, description])
      return infos
    })

    infoItems = [...infoItems, ...infoItem]
  }

  let categories = [];
  CategoriesAr.forEach((item, index) => {
    categories.push([index, -1, CategoriesFr[index][0], item[0]]);
  });

  CategoriesAr.forEach((item, index) => {
    item[1].forEach((sousCatego, ind)=>{
      categories.push([categories.length, index, CategoriesFr[index][1][ind],sousCatego]);
    })
  });

  let products = [];
  infoItems.forEach((item, index) => {
    products = [...products, [index, ...item]];
  });

  
  writeToCsv(categories, ['id', 'parent', 'textAr', 'textFr'],  'categories')
  writeToCsv(products, ['id', 'titrFr', 'categorieFr', 'ref', 'niveau', 'prix', 'img', 'description'], 'products')

  // Close the browser
  await browser.close();
};

// Start the scraping
getData();