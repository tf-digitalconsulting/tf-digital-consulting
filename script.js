/* =========================
   OUTIL D'ANALYSE DE DOCUMENT
========================= */

const btnAnalyser = document.getElementById('btn-analyser');
const zoneResultat = document.getElementById('resultat');

// Clé pour limiter à 1 essai gratuit par navigateur
const CLE_ESSAI = 'tf_essai_utilise';

function essaiDejaUtilise() {
    return localStorage.getItem(CLE_ESSAI) === 'true';
}

function marquerEssaiUtilise() {
    localStorage.setItem(CLE_ESSAI, 'true');
}

if (btnAnalyser) {
    btnAnalyser.addEventListener('click', function () {

        const texte = document.getElementById('texte-utilisateur').value.trim();
        const type = document.getElementById('type-analyse').value;

        // 1. Vérification : texte vide
        if (!texte) {
            zoneResultat.innerHTML =
                '<p><strong>Veuillez coller un texte à analyser.</strong></p>';
            return;
        }

        // 2. Vérification : essai déjà utilisé
        if (essaiDejaUtilise()) {
            zoneResultat.innerHTML = `
                <h3>Essai gratuit déjà utilisé</h3>
                <p>
                    Vous avez déjà bénéficié de l'analyse gratuite.
                    Pour continuer, choisissez un service payant.
                </p>
                <a href="#tarifs" class="btn">Voir les tarifs</a>
            `;
            return;
        }

        // 3. Calculs de base
        const mots = texte.split(/\s+/).filter(function (m) { return m.length > 0; }).length;
        const phrases = texte.split(/[.!?]+/).filter(function (p) { return p.trim().length > 0; }).length;
        const paragraphes = texte.split(/\n\s*\n/).filter(function (p) { return p.trim().length > 0; }).length;
        const motsParPhrase = phrases > 0 ? Math.round(mots / phrases) : 0;

        let contenu = '';

        // 4. Analyse selon le type choisi
        if (type === 'structure') {
            contenu = `
                <ul>
                    <li>Nombre de mots : <strong>${mots}</strong></li>
                    <li>Nombre de phrases : <strong>${phrases}</strong></li>
                    <li>Nombre de paragraphes : <strong>${paragraphes}</strong></li>
                    <li>Mots par phrase (moyenne) : <strong>${motsParPhrase}</strong></li>
                    <li>${motsParPhrase > 25
                        ? 'Attention : vos phrases sont longues, pensez à les raccourcir.'
                        : 'Longueur de phrase correcte.'}</li>
                </ul>
            `;
        } else if (type === 'lisibilite') {
            const score = motsParPhrase < 15 ? 'Facile'
                        : motsParPhrase < 25 ? 'Moyen'
                        : 'Difficile';
            contenu = `
                <ul>
                    <li>Score de lisibilité : <strong>${score}</strong></li>
                    <li>Mots par phrase : <strong>${motsParPhrase}</strong></li>
                    <li>${motsParPhrase < 15
                        ? 'Texte facile à lire.'
                        : motsParPhrase < 25
                        ? 'Texte de difficulté moyenne.'
                        : 'Texte difficile à lire. Raccourcissez vos phrases.'}</li>
                </ul>
            `;
        } else if (type === 'repetitions') {
            const motsListe = texte.toLowerCase().match(/\b[a-zàâçéèêëîïôûùüÿñæœ]{4,}\b/g) || [];
            const compteur = {};
            motsListe.forEach(function (m) {
                compteur[m] = (compteur[m] || 0) + 1;
            });

            const top = Object.entries(compteur)
                .filter(function (entry) { return entry[1] > 2; })
                .sort(function (a, b) { return b[1] - a[1]; })
                .slice(0, 10);

            contenu = top.length > 0
                ? '<p>Mots répétés plus de 2 fois :</p><ul>' +
                  top.map(function (entry) {
                      return '<li>« ' + entry[0] + ' » : ' + entry[1] + ' fois</li>';
                  }).join('') +
                  '</ul>'
                : '<p>Aucune répétition excessive détectée.</p>';
        }

        // 5. Affichage
        zoneResultat.innerHTML = `
            <h3>Résultat de l'analyse</h3>
            ${contenu}
            <p style="margin-top:20px;color:#4B5568;font-size:14px;">
                Cette analyse est automatique et gratuite (1 essai).
                Pour une correction complète, choisissez un service payant.
            </p>
        `;

        marquerEssaiUtilise();
    });
}