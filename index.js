import puppeteer from 'puppeteer';
import fs from 'fs';

async function openWebPage() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 200
  });
  const page = await browser.newPage();
    
  await page.goto('https://www.google.com');
  await browser.close();
}

async function captureScreenshot() {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 200
    });
    const page = await browser.newPage();
      
    await page.goto('https://www.google.com');
    await page.screenshot({ path: 'google.png' });
    await browser.close();
}

async function navigateWebPage() {
    const browser = await puppeteer.launch({ // Iniciar el navegador
      headless: false, // Para que se muestre el navegador
      slowMo: 250 // slow down by 250ms
    });
    const page = await browser.newPage(); // Crear una nueva página
      
    await page.goto('https://quotes.toscrape.com/'); // Navegar a la página
    await page.click('a[href="/login"]'); // Click en el link de login
    await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
    await browser.close(); // Cerrar el navegador
}

async function getDataFromWebPage() {
    const browser = await puppeteer.launch({ 
      headless: false, 
      slowMo: 400
    });
    const page = await browser.newPage();
      
    await page.goto('https://www.example.com'); // Navegar a la página
    const result = await page.evaluate(() => { // Ejecutar código en el contexto de la página
      const title = document.querySelector('h1').innerText; // Seleccionar el título
      const descrition = document.querySelector('p').innerText; // Seleccionar la descripción
      const more = document.querySelector('a').href; // Seleccionar el link
      return { title, descrition, more };
    }); 
    console.log(result); // Imprimir el resultado
    await browser.close();
}

async function handleDynamicWebPage() {
    const browser = await puppeteer.launch({ 
      headless: false, 
      slowMo: 400
    });
    const page = await browser.newPage();
      
    await page.goto('https://quotes.toscrape.com/'); 
    
    const result = await page.evaluate(() => {
      const quotes = document.querySelectorAll('.quote');
      const data = [...quotes].map(quote => {
        const text = quote.querySelector('.text').innerText;
        const author = quote.querySelector('.author').innerText;
        const tags = [...quote.querySelectorAll('.tag')].map(tag => tag.innerText);
        return { text, author, tags };
      });
      return(data);
    }); 
    console.log(result);
    await page.pdf({path: 'hn.pdf', format: 'A4'}); // Generar un PDF
    await fs.writeFileSync('quotes.json', JSON.stringify(result, null, 2)); // Guardar los datos en un archivo JSON
    await browser.close();
}

async function getProductFromWebPage(){
  const URL = 'https://www.amazon.com.mx/s?k=transformers+fall+of+cybertron&crid=1T8M4AHAMDTWL&sprefix=transformers+fall%2Caps%2C219&ref=nb_sb_ss_ts-doa-p_2_17';
  const browser = await puppeteer.launch({headless: false});

  const page = await browser.newPage();
  await page.goto(URL, {waitUntil: 'networkidle2'});

  const title = await page.title();
  console.log("Titulo de la pagina: ", title);

  let products = [];
  let nextPage = true;

  while (nextPage) {
    const newProducts = await page.evaluate(() => {
      const products = document.querySelectorAll('.puis-card-container.s-card-container');
      console.log(products.length);

        const data = [...products].map(product => {
          const title = product.querySelector('.a-text-normal')?.innerText;
          const price = product.querySelector('.a-price-whole')?.innerText;
          const fraction = product.querySelector('.a-price-fraction')?.innerText;
          const image = product.querySelector('.s-image')?.src;
          const rating = product.querySelector('.a-size-base.s-underline-text')?.innerText;
          
          if (!price || !fraction){
            return{
              title: '',
              price: 0,
              image: '',
              rating: 0
            }
          }

          const priceWholeCleaned = price.replace(/\n/g, "").trim();
          const fractionCleaned = fraction.replace(/\n/g, "").trim();

          console.log(title);
          console.log(price);
          console.log(fraction);

          return { 
            title, 
            price:`${priceWholeCleaned}${fractionCleaned}`,
            image,
            rating
          };

        });
        return data;
    });

    products = [...products, ...newProducts];


    nextPage = await page.evaluate(() => {
      const nextButton = document.querySelector('.s-pagination-next');
      if (nextButton && !nextButton.classList.contains('.s-pagination-disabled')){
          nextButton.click();
          return true;
        }

      return false;        
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('products',products);
  await browser.close();
}

getProductFromWebPage();
//handleDynamicWebPage();
//getDataFromWebPage();
//navigateWebPage();
//captureScreenshot();
//openWebPage();