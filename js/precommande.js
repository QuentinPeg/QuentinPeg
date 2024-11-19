/* Au chargement de la page*/
var boutonsSupprimerTout = document.getElementsByClassName('btn-supprimer-tout');

window.addEventListener('load', mettreAJourNombreArticlesPanier);

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (event) {
        const panierLink = document.querySelector('.panier-link');
        const panier = document.getElementById('panier-fenetre');

        if (!panierLink.contains(event.target) && !panier.contains(event.target)) {
            panier.style.display = 'none';
        }
    });

    const panierLink = document.querySelector('.panier-link');
    panierLink.addEventListener('click', function (event) {
        const panier = document.getElementById('panier-fenetre');
        panier.style.display = 'block';
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Sélectionner la div à supprimer en utilisant un sélecteur CSS
    var divASupprimer = document.querySelector('div[style="text-align: right;position: fixed;z-index:9999999;bottom: 0;width: auto;right: 1%;cursor: pointer;line-height: 0;display:block !important;"]');

    // Vérifier si la div existe
    if (divASupprimer) {
        // Supprimer la div
        divASupprimer.parentNode.removeChild(divASupprimer);
    } else {
        console.log("La div spécifiée n'existe pas.");
    }
});

Array.from(boutonsSupprimerTout).forEach(function (bouton) {
    bouton.addEventListener('click', function () {
        fetch('afficher_panier.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'action=clear_cart'
        })
            .then(response => response.text())
            .then(data => {
                document.getElementById('panier-liste').innerHTML = data;
                mettreAJourNombreArticlesPanier();
            })
            .catch(error => console.error('Erreur:', error));
    });
});

window.addEventListener("scroll", function () {
    var header = document.querySelector("header");
    var h1 = document.querySelector("h1");
    var a = document.querySelector("#entete>a");
    var imgipage = document.querySelector("img");
    var imgipanier = document.querySelector(".panier-link img");
    var nb = document.querySelector(".nombre-articles-panier");
    var panier = document.querySelector(".panier-fenetre");
    var bulle = document.querySelector(".panier-bulle");

    if (window.scrollY > 50) {
        header.classList.add("shrink");
        h1.classList.add("shrink");
        a.classList.add("shrink");
        imgipage.classList.add("shrink");
        imgipanier.classList.add("shrink");
        nb.classList.add("shrink");
        panier.classList.add("shrink");
        if (bulle !== null) {
            bulle.classList.add("shrink");
        }
    } else {
        header.classList.remove("shrink");
        h1.classList.remove("shrink");
        a.classList.remove("shrink");
        imgipage.classList.remove("shrink");
        imgipanier.classList.remove("shrink");
        nb.classList.remove("shrink");
        panier.classList.remove("shrink");
        if (bulle !== null) {
            bulle.classList.remove("shrink");
        }
    }
});

/* Les fontions de la précommande */

function validerOuverturePreco(nombreArticles) {
    if (nombreArticles === 0) {
        alert('Votre panier est vide. Veuillez ajouter des articles.');
        return false;
    }

    if (nombreArticles > 10) {
        alert('Vous ne pouvez pas avoir plus de 10 articles dans votre panier.');
        return false;
    }

    return true;
}

function afficherPrecommande() {
    var nombreArticles = obtenirNombreArticlesPanier();

    if (!validerOuverturePreco(nombreArticles)) {
        return;
    }

    var precommandeFenetre = document.getElementById('precommande-fenetre');
    var panierFenetre = document.getElementById('panier-fenetre');

    masquerPanier();

    precommandeFenetre.style.display = 'flex';
    calculerTotal();

    afficherRecapArticles();
}

function afficherRecapArticles() {
    calculerTotal();
    var recapArticlesDiv = document.getElementById('recap-articles');
    recapArticlesDiv.textContent = '';

    fetch('afficher_panier.php')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const items = Array.from(doc.querySelectorAll('li'));

            // Trier les articles par titre de produit
            items.sort((a, b) => {
                const formA = a.querySelector('form');
                const formB = b.querySelector('form');
                const titleA = formA.querySelector('input[name="product_title"]').value.toLowerCase();
                const titleB = formB.querySelector('input[name="product_title"]').value.toLowerCase();
                return titleA.localeCompare(titleB);
            });

            items.forEach(item => {
                const form = item.querySelector('form');
                if (form) {
                    const productTitle = form.querySelector('input[name="product_title"]').value;
                    const format = form.querySelector('input[name="format"]').value;
                    const plastifie = form.querySelector('input[name="plastifie"]').value;
                    const quantity = parseInt(form.textContent.match(/\d+/)[0], 10);
                    const premdiv = document.createElement('span');
                    const divquantite = document.createElement('span');
                    premdiv.style.maxWidth = '255px';

                    // Créer les boutons d'augmentation et de diminution
                    const btnDecrease = document.createElement('button');
                    btnDecrease.textContent = '-';
                    const btnIncrease = document.createElement('button');
                    btnIncrease.textContent = '+';

                    // Ajouter des écouteurs d'événements aux boutons
                    btnDecrease.addEventListener('click', function () {
                        const currentQuantity = parseInt(divquantite.getAttribute('data-quantity'), 10);
                        console.log(divquantite.getAttribute('data-quantity'))
                        divquantite.setAttribute('data-quantity', currentQuantity - 1);
                        console.log(divquantite.getAttribute('data-quantity'))

                        // this.previousElementSibling.textContent = `[${currentQuantity - 1}]`;
                        console.log(currentQuantity)
                        updateCart('decrement', productTitle, format, plastifie);
                        calculerTotal(); // Recalculate the total
                    });

                    btnIncrease.addEventListener('click', function () {
                        const currentQuantity = parseInt(divquantite.getAttribute('data-quantity'), 10);
                        divquantite.setAttribute('data-quantity', currentQuantity + 1);
                        this.previousElementSibling.textContent = `[${currentQuantity + 1}]`;
                        console.log(currentQuantity);
                        updateCart('increment', productTitle, format, plastifie);
                        calculerTotal(); // Recalculate the total
                    });


                    // Créer des nœuds de texte pour quantité et titre
                    // Lors de la création de la quantité
                    const textQuantite = document.createTextNode(`[${quantity}]`);
                    divquantite.setAttribute('data-quantity', quantity);
                    const textfois = document.createElement('span');
                    textfois.textContent = ' x ';
                    const textTitre = document.createTextNode(`${productTitle}`);

                    premdiv.className = 'premdiv';
                    btnDecrease.className = 'btn-quantite';
                    btnIncrease.className = 'btn-quantite';
                    divquantite.appendChild(btnDecrease);
                    divquantite.appendChild(textQuantite);
                    divquantite.appendChild(btnIncrease);
                    divquantite.style.width = 'fit-content';
                    premdiv.appendChild(divquantite);
                    premdiv.appendChild(textfois);
                    premdiv.appendChild(textTitre);

                    const articleElement = document.createElement('p');
                    articleElement.id = `${productTitle}-${format}-${plastifie}`;

                    const labelFormat = document.createElement('label');
                    labelFormat.textContent = 'Format :';
                    const selectFormat = createFormatSelect(productTitle, quantity, `${productTitle}-${format}-Format`, format);

                    const labelPlastifie = document.createElement('label');
                    labelPlastifie.textContent = 'Plastifié :';
                    const selectPlastifie = createPlastifieSelect(productTitle, quantity, `${productTitle}-${plastifie}-Plastifie`, plastifie);

                    selectFormat.setAttribute('data-format', format);
                    selectPlastifie.setAttribute('data-plastifie', plastifie);

                    var prixArticle = obtenirPrixArticle(productTitle, format);
                    // Appliquer la logique de plastification
                    if (plastifie === 'Oui') {
                        prixArticle += prixArticle * 0.10;
                    }
                    var prixTotArticle = quantity * prixArticle;

                    // Créer un élément pour afficher le prix total par ligne
                    const prixTotArticleElement = document.createElement('span');
                    prixTotArticleElement.textContent = formaterPrix(prixTotArticle);
                    // Écouter l'événement de redimensionnement de la fenêtre
                    window.addEventListener('resize', function () {
                        // Vérifier si la largeur de l'écran est de 600px ou moins
                        if (window.innerWidth <= 600) {
                            // Appliquer le style fit-content
                            prixTotArticleElement.style.width = 'fit-content';
                        } else {
                            // Réinitialiser le style ou appliquer un autre style si nécessaire
                            prixTotArticleElement.style.width = '71px';
                        }
                    });

                    // Appeler la fonction immédiatement pour appliquer le style au chargement initial
                    if (window.innerWidth <= 600) {
                        prixTotArticleElement.style.width = 'fit-content';
                    } else {
                        prixTotArticleElement.style.width = '71px';
                    }
                    articleElement.appendChild(premdiv);
                    articleElement.appendChild(labelFormat);
                    articleElement.appendChild(selectFormat);
                    articleElement.appendChild(labelPlastifie);
                    articleElement.appendChild(selectPlastifie);
                    articleElement.appendChild(prixTotArticleElement); // Ajouter le prix total comme élément de texte

                    recapArticlesDiv.appendChild(articleElement);
                }
            });
        })
        .catch(error => console.error("Erreur lors du chargement des articles :", error));


}

function createFormatSelect(nom, quantite, key, selectedFormat) {
    var selectFormat = document.createElement('select');
    selectFormat.setAttribute('data-nom', nom);
    selectFormat.setAttribute('data-quantite', quantite);
    selectFormat.setAttribute('data-key', key);

    var optionA5 = createOption('A5', 'A5', selectedFormat);
    var optionA6 = createOption('A6', 'A6', selectedFormat);

    selectFormat.appendChild(optionA5);
    selectFormat.appendChild(optionA6);
    selectFormat.value = selectedFormat;

    selectFormat.addEventListener('change', function (event) {
        var selectedFormat = event.target.value;
        var key = event.target.getAttribute('data-key');
        var articleId = key.split('-')[0];
        var plastifie = document.querySelector(`select[data-nom="${nom}"][data-plastifie]`).value;

        // Update cart with new format
        updateCart('update_format', nom, selectedFormat, plastifie);
    });


    return selectFormat;
}

function createPlastifieSelect(nom, quantite, key, selectedPlastifie) {
    var selectPlastifie = document.createElement('select');
    selectPlastifie.setAttribute('data-nom', nom);
    selectPlastifie.setAttribute('data-quantite', quantite);
    selectPlastifie.setAttribute('data-key', key);

    var optionNon = createOption('Non', 'Non', selectedPlastifie);
    var optionOui = createOption('Oui', 'Oui', selectedPlastifie);

    selectPlastifie.appendChild(optionNon);
    selectPlastifie.appendChild(optionOui);
    selectPlastifie.value = selectedPlastifie;

    selectPlastifie.addEventListener('change', function (event) {
        var selectedPlastifie = event.target.value;
        var key = event.target.getAttribute('data-key');
        var articleId = key.split('-')[0];
        var format = document.querySelector(`select[data-nom="${nom}"][data-format]`).value;

        // Update cart with new plastification
        updateCart('update_plastifie', nom, format, selectedPlastifie);
    });

    return selectPlastifie;
}

function createOption(value, text, selectedValue) {
    var option = document.createElement('option');
    option.setAttribute('value', value);
    option.textContent = text;
    if (value === selectedValue) {
        option.selected = true;
    }
    return option;
}

function fermerPrecommande() {
    var precommandeFenetre = document.getElementById('precommande-fenetre');
    precommandeFenetre.style.display = 'none';
}

/* Les fonctions de prix */
var articlesPrix = {
    'Pack Intégral': {
        'A6': 250,
        'A5': 290,
    },
    'Pack Première Année': {
        'A6': 86,
        'A5': 117
    },
    'Pack Deuxième Année': {
        'A6': 99,
        'A5': 130
    },
    'Pack Troisième Année': {
        'A6': 69,
        'A5': 96
    },
    'Pack Semestre 1': {
        'A6': 69,
        'A5': 92
    },
    'Pack Semestre 3': {
        'A6': 71,
        'A5': 86
    },
    'Soins Infirmier': {
        'A6': 35,
        'A5': 43
    },
    'Cycle De La Vie Et Grande Fonction (UE 2.2 semestre 1)': {
        'A6': 30,
        'A5': 38
    },
    'Biologie Fondamentale (UE 2.1 semestre 1)': {
        'A6': 20,
        'A5': 28
    },
    'Processus Traumatique (UE 2.4 semestre 1)': {
        'A6': 23,
        'A5': 31
    },
    'Processus Psychopathologique (UE 2.6 semestre 2)': {
        'A6': 30,
        'A5': 38,
    },
    'Processus Psychopathologique (UE 2.6 semestre 5)': {
        'A6': 18,
        'A5': 26
    },
    'Processus Obstructif (UE 2.8 semestre 3)': {
        'A6': 17,
        'A5': 25
    },
    'Processus Infectieux (UE 2.5 semestre 3)': {
        'A6': 38,
        'A5': 46
    },
    'Processus Dégénératif (UE 2.7 semestre 4)': {
        'A6': 30,
        'A5': 38
    },
    'Processus Tumoraux (UE 2.9 semestre 5)': {
        'A6': 35,
        'A5': 43
    },
};

function obtenirPrixArticle(nomArticle, format) {
    var prix = 0;

    switch (nomArticle) {
        case 'Pack Intégral':
            prix = articlesPrix['Pack Intégral'][format];
            break;
        case 'Pack Première Année':
            prix = articlesPrix['Pack Première Année'][format];
            break;
        case 'Pack Deuxième Année':
            prix = articlesPrix['Pack Deuxième Année'][format];
            break;
        case 'Pack Troisième Année':
            prix = articlesPrix['Pack Troisième Année'][format];
            break;
        case 'Pack Semestre 1':
            prix = articlesPrix['Pack Semestre 1'][format];
            break;
        case 'Pack Semestre 3':
            prix = articlesPrix['Pack Semestre 3'][format];
            break;
        case 'Soins Infirmier':
            prix = articlesPrix['Soins Infirmier'][format];
            break;
        case 'Cycle De La Vie Et Grande Fonction (UE 2.2 semestre 1)':
            prix = articlesPrix['Cycle De La Vie Et Grande Fonction (UE 2.2 semestre 1)'][format];
            break;
        case 'Biologie Fondamentale (UE 2.1 semestre 1)':
            prix = articlesPrix['Biologie Fondamentale (UE 2.1 semestre 1)'][format];
            break;
        case 'Processus Traumatique (UE 2.4 semestre 1)':
            prix = articlesPrix['Processus Traumatique (UE 2.4 semestre 1)'][format];
            break;
        case 'Processus Psychopathologique (UE 2.6 semestre 2)':
            prix = articlesPrix['Processus Psychopathologique (UE 2.6 semestre 2)'][format];
            break;
        case 'Processus Psychopathologique (UE 2.6 semestre 5)':
            prix = articlesPrix['Processus Psychopathologique (UE 2.6 semestre 5)'][format];
            break;
        case 'Processus Obstructif (UE 2.8 semestre 3)':
            prix = articlesPrix['Processus Obstructif (UE 2.8 semestre 3)'][format];
            break;
        case 'Processus Infectieux (UE 2.5 semestre 3)':
            prix = articlesPrix['Processus Infectieux (UE 2.5 semestre 3)'][format];
            break;
        case 'Processus Dégénératif (UE 2.7 semestre 4)':
            prix = articlesPrix['Processus Dégénératif (UE 2.7 semestre 4)'][format];
            break;
        case 'Processus Tumoraux (UE 2.9 semestre 5)':
            prix = articlesPrix['Processus Tumoraux (UE 2.9 semestre 5)'][format];
            break;
        default:
            // Si l'article n'est pas reconnu, le prix reste à 0
            break;
    }

    return prix

}

function calculerTotal() {
    var total = 0;
    // Sélectionner tous les éléments p dans le div recap-articles
    const articles = document.querySelectorAll('#recap-articles > p');

    articles.forEach(article => {
        // Récupérer le dernier span dans chaque p
        const quantitySpan = article.querySelector('.premdiv span[data-quantity]');
        const quantity = parseInt(quantitySpan.getAttribute('data-quantity'), 10);
        const format = article.querySelector('select[data-format]').value;
        const plastifie = article.querySelector('select[data-plastifie]').value;

        // Utiliser l'ID pour extraire le nom de l'article pour obtenir le prix
        const nomArticle = article.id.split('-')[0];
        var prixUnitaire = obtenirPrixArticle(nomArticle, format);

        // Appliquer la logique de plastification
        if (plastifie === 'Oui') {
            prixUnitaire += prixUnitaire * 0.10; // Augmentez le prix de 10% si plastifié
        }

        total += prixUnitaire * quantity;
    });

    // Mettre à jour le total dans l'élément HTML correspondant
    document.getElementById('amount').value = total;
    document.getElementById("prixTotal").textContent = formaterPrix(total);
}


function formaterPrix(prix) {
    return prix % 1 !== 0 ? prix.toFixed(2).replace('.', ',') + ' €' : prix.toFixed(0) + ' €';
}

/* Les fonctions de Panier */

function addToCart(id, quantity, format, plastifie) {
    fetch('index.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'product_id=' + encodeURIComponent(id) +
            '&quantity=' + encodeURIComponent(quantity) +
            '&format=' + encodeURIComponent(format) +
            '&plastifie=' + encodeURIComponent(plastifie)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                mettreAJourNombreArticlesPanier();
            } else {
                console.error('Error adding item to cart:', data.message);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    calculerTotal();
}

function showCart() {
    var precommandeFenetre = document.getElementById('precommande-fenetre');
    var modal = document.getElementById('panier-fenetre');
    if (window.getComputedStyle(precommandeFenetre).display === "none") {
        modal.style.display = 'block';
        fetch('afficher_panier.php')
            .then(response => response.text())
            .then(data => document.getElementById('panier-liste').innerHTML = data);
    }
    else {
        modal.style.display = 'flex';
        precommandeFenetre.style.display = 'none';
    }
    calculerTotal();
}

function updateCart(action, productTitle, format, plastifie) {
    fetch('afficher_panier.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `action=${action}&product_title=${encodeURIComponent(productTitle)}&format=${encodeURIComponent(format)}&plastifie=${encodeURIComponent(plastifie)}`
    })
        .then(response => response.text())
        .then(data => {
            document.getElementById('panier-liste').innerHTML = data;

            mettreAJourNombreArticlesPanier();
        })
        .catch(error => console.error('Erreur lors de la mise à jour du panier:', error));

    calculerTotal();
}

function mettreAJourNombreArticlesPanier() {
    var bullePanier = document.getElementById('panier-bulle');

    fetch('afficher_panier.php')
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            const items = doc.querySelectorAll('li');
            let totalQuantity = 0;

            items.forEach(item => {
                const text = item.textContent;
                const match = text.match(/-\s*(\d+)\s*\+/);
                if (match && match[1]) {
                    const quantity = parseInt(match[1], 10);
                    totalQuantity += quantity;
                }
            });
            bullePanier.textContent = totalQuantity;

        })
        .catch(error => console.error("Erreur lors de la mise à jour du nombre d'articles :", error));
    afficherRecapArticles();
}

function obtenirNombreArticlesPanier() {
    var bullePanier = document.getElementById('panier-bulle');
    var nombreArticles = parseInt(bullePanier.textContent, 10);
    return isNaN(nombreArticles) ? 0 : nombreArticles;
}

function clearCart() {
    const formData = new FormData();
    formData.append('action', 'clear_cart');
    fetch('afficher_panier.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(data => document.getElementById('panier-liste').innerHTML = data);
    mettreAJourNombreArticlesPanier;
    mettreAJourNombreArticlesPanier();
}

function masquerPanier() {
    var panierFenetre = document.getElementById('panier-fenetre');
    panierFenetre.style.display = 'none';
}

/* Les fonctions de carroussel */

var carousel = document.getElementById('carousel');
var scrollAmount = 0;
var scrollTime = 10000; // Temps de défilement en millisecondes



setInterval(rotateImages, scrollTime);

function rotateImages() {
    scrollAmount++;
    if (scrollAmount >= carousel.childElementCount) {
        scrollAmount = 0;
    }
    carousel.scrollTo({
        top: 0,
        left: scrollAmount * carousel.offsetWidth,
        behavior: 'smooth'
    });
}

function prevImage() {
    scrollAmount--;
    if (scrollAmount < 0) {
        scrollAmount = carousel.childElementCount - 1;
    }
    carousel.scrollTo({
        top: 0,
        left: scrollAmount * carousel.offsetWidth,
        behavior: 'smooth'
    });
}

function nextImage() {
    scrollAmount++;
    if (scrollAmount >= carousel.childElementCount) {
        scrollAmount = 0;
    }
    carousel.scrollTo({
        top: 0,
        left: scrollAmount * carousel.offsetWidth,
        behavior: 'smooth'
    });
}
