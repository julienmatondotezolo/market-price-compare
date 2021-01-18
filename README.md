# market-price-compare
supermarket price comparator

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Unofficial_JavaScript_logo_2.svg/1024px-Unofficial_JavaScript_logo_2.svg.png" alt="drawing" width="30" />
</br>
<img src="https://scand.com/wp-content/uploads/2019/10/logo-node.png" alt="drawing" width="50" style="margin"/>
</br>
<img src="https://user-images.githubusercontent.com/10379601/29446482-04f7036a-841f-11e7-9872-91d1fc2ea683.png" alt="drawing" width="40" style="margin"/>

An API to compare all the supermarket prices in your neighboorhood

## Requirements

You can use this api to find the best prices on different supermarkets.

Use the package manager [yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/) to install all the requirements.
-   Packages
    - [puppeteer](https://classic.yarnpkg.com/en/package/puppeteer)
    - [express](https://classic.yarnpkg.com/en/package/exrpress)
    - [body-parser](https://yarnpkg.com/package/body-parser)
    - [http](https://yarnpkg.com/package/http)
-   Testing
    - [jest](https://classic.yarnpkg.com/en/package/jest)
    - [jest-puppeteer](https://yarnpkg.com/package/jest-puppeteer)

## Install packages

```
yarn add puppeteer
yarn add express
yarn add body-parser
yarn add http
```

## Install packages
Run terminal on the API folder.
```
npm install
```

## Make containers
Run terminal on your root folder.
```
docker compose up
```

## Start API
Run terminal on the API folder.
```
npm start
```

## Run tests on API
Run terminal on the API folder.
```
npm test
```

## Endpoints
Run terminal on the API folder.

[/shop](http://localhost:3000/shop/) To see all products [ GET ]</br>
[/shop/:id](http://localhost:3000/shop/id) To search a product by name [ GET ]</br>
[/shop](http://localhost:3000/shop/id) To delete a shop [ DELETE ]</br>
[/addproduct](http://localhost:3000/shop/id) To add a product [ POST ] </br>
[/addshop](http://localhost:3000/shop/id) To add a shop [ POST ] </br>


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](/LICENSE)

