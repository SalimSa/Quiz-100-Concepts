import { useState, useCallback } from "react";

const catColors = {
  "Sens & Direction": "#E8453C", "Résilience": "#F5A623", "Pensée": "#7B61FF",
  "Temps": "#4ECDC4", "Croissance": "#2ECC71", "Argent": "#F1C40F",
  "Relations": "#E91E8F", "Bien-être": "#3498DB", "Décision": "#FF6B35", "Sagesse": "#8E7CC3",
};

// conceptDetails: keyed by concept name, provides visual + detail for post-answer
const conceptDetails = {
  "Ikigai": { visual: "🎯❤️💼🌍", title: "Les 4 cercles de l'Ikigai", detail: "L'Ikigai se trouve à l'intersection de 4 sphères : ce que tu AIMES (passion), ce en quoi tu EXCELLES (talent), ce dont le MONDE A BESOIN (mission) et ce pour quoi tu peux être PAYÉ (métier). Quand les 4 se chevauchent, tu as trouvé ta raison d'être.", diagram: ["Ce que j'aime ❤️", "Ce en quoi j'excelle ⭐", "Ce dont le monde a besoin 🌍", "Ce pour quoi on me paie 💰"], diagramType: "4circles" },
  "Dharma": { visual: "🕉️🛤️", title: "La Roue du Dharma", detail: "Dans la tradition hindoue et bouddhiste, le Dharma est la loi cosmique qui maintient l'ordre. À l'échelle individuelle, c'est ton devoir sacré, le chemin aligné avec ta vraie nature. Agir contre son Dharma crée de la souffrance." },
  "Amor Fati": { visual: "🔥💪", title: "L'Amour du Destin", detail: "Nietzsche va plus loin que le stoïcisme : il ne s'agit pas juste d'accepter ce qui arrive, mais de l'AIMER. Chaque épreuve, chaque douleur est une occasion de croissance. « Ma formule pour la grandeur : Amor Fati. »" },
  "Memento Mori": { visual: "💀⏳", title: "La Vanité et le Crâne", detail: "Les généraux romains en triomphe avaient un esclave qui leur murmurait « Memento Mori ». En peinture, les vanités (crâne + bougie + fleurs fanées) rappellent que tout est éphémère. Paradoxalement, cette conscience rend chaque instant plus précieux." },
  "Eudaimonia": { visual: "✨🏛️", title: "Le Bonheur selon Aristote", detail: "Contrairement à l'hédonisme (plaisir immédiat), l'Eudaimonia est le bonheur qui vient de vivre vertueusement et de réaliser son potentiel. Pour Aristote, c'est le but ultime de la vie humaine — l'épanouissement par l'excellence." },
  "Telos": { visual: "🎯🏛️", title: "La Cause Finale", detail: "Pour Aristote, tout a un Telos : le gland a pour finalité de devenir chêne. Appliqué à l'humain, la question est : vers quoi tends-tu naturellement ? Quel est le but profond de ta vie ?" },
  "Kintsugi": { visual: "🏺✨", title: "L'Or dans les Fêlures", detail: "Au XVᵉ siècle, un shogun envoie un bol cassé en Chine pour réparation. Il revient avec d'affreuses agrafes. Les artisans japonais inventent alors le Kintsugi : remplir les fêlures de laque et d'or. Le bol réparé est plus beau que l'original.", diagram: ["Objet cassé 💔", "Réparation à l'or ✨", "Plus beau qu'avant 🏆"], diagramType: "flow" },
  "Antifragilité": { visual: "💎📈", title: "Au-delà de la Résilience", detail: "Taleb distingue 3 états : FRAGILE (le verre casse sous le choc), ROBUSTE (la roche résiste), ANTIFRAGILE (le muscle se renforce). Le système immunitaire, les startups agiles, l'évolution sont antifragiles.", diagram: ["Fragile 🥚 — casse", "Robuste 🪨 — résiste", "Antifragile 💎 — se renforce"], diagramType: "levels" },
  "Wabi-sabi": { visual: "🍂🍵", title: "La Beauté Imparfaite", detail: "Né de la cérémonie du thé de Sen no Rikyū, le Wabi-sabi trouve la beauté dans l'asymétrie, la rugosité, la simplicité et l'éphémère. Un bol de thé irrégulier est plus beau qu'un bol parfait. L'impermanence rend les choses précieuses." },
  "Grit": { visual: "⚡🏃", title: "Passion × Persévérance", detail: "Angela Duckworth a étudié des cadets de West Point, des champions d'orthographe et des vendeurs. Résultat : le Grit (persévérance passionnée) prédit le succès mieux que le QI ou le talent. Grit = Passion + Persévérance sur le LONG terme." },
  "Negative Capability": { visual: "🌫️🧘", title: "Vivre dans l'Incertitude", detail: "En 1817, Keats écrit que Shakespeare possédait cette qualité rare : rester dans l'incertitude et le mystère sans chercher frénétiquement des faits et des raisons. Dans un monde complexe, cette capacité est un superpouvoir." },
  "Impuissance apprise": { visual: "🔓🐕", title: "L'Expérience de Seligman", detail: "Des chiens recevaient des chocs inévitables. Plus tard, même quand la fuite était possible, ils restaient passifs. Les humains font pareil : après des échecs répétés, on croit (à tort) qu'on ne peut rien changer. La bonne nouvelle : ça se désapprend." },
  "Stoïcisme": { visual: "🏛️⚖️", title: "La Dichotomie du Contrôle", detail: "Le cœur du Stoïcisme : distingue ce qui dépend de toi (tes pensées, tes actions) de ce qui n'en dépend pas (le temps, les autres, le passé). Concentre 100% de ton énergie sur le premier cercle." },
  "Rasoir d'Occam": { visual: "✂️💡", title: "Le Principe de Parcimonie", detail: "Guillaume d'Occam (XIVᵉ siècle) : entre deux explications, choisis la plus simple. Ce n'est pas que la plus simple est toujours vraie, mais qu'il ne faut pas multiplier les hypothèses sans nécessité." },
  "Dunning-Kruger": { visual: "🤔📊", title: "La Montagne de la Stupidité", detail: "La courbe en 4 phases : 1) Pic de la confiance du débutant (je sais tout), 2) Vallée du désespoir (je ne sais rien), 3) Pente de l'illumination (j'apprends), 4) Plateau de la sagesse (je sais ce que je ne sais pas).", diagram: ["Pic de confiance 🏔️", "Vallée du désespoir 🕳️", "Pente d'illumination 📈", "Plateau de sagesse 🧘"], diagramType: "flow" },
  "Biais de confirmation": { visual: "🔍🧠", title: "Le Filtre Invisible", detail: "Ton cerveau filtre inconsciemment les informations pour ne garder que celles qui confirment tes croyances existantes. Résultat : tu te sens de plus en plus sûr d'avoir raison, même quand tu as tort." },
  "Inversion": { visual: "🔄🎯", title: "Penser à l'Envers", detail: "Charlie Munger : « Dis-moi où je vais mourir, et je n'irai pas là-bas. » Au lieu de demander « comment réussir ? », demande « comment échouer à coup sûr ? » puis fais l'inverse. L'inversion révèle les angles morts." },
  "Steel-manning": { visual: "🛡️⚔️", title: "L'Inverse du Straw Man", detail: "Le Straw Man déforme l'argument adverse pour le rendre facile à attaquer. Le Steel Man fait l'inverse : reformuler l'argument dans sa version la PLUS FORTE. Si tu peux le réfuter dans cette version, ta position est solide." },
  "Via Negativa": { visual: "➖✨", title: "Enlever pour Progresser", detail: "Souvent, le progrès vient de ce qu'on ENLÈVE, pas de ce qu'on ajoute. Enlever les mauvaises habitudes > ajouter des bonnes. Enlever les clients toxiques > chercher plus de clients. Michel-Ange : « J'ai juste enlevé tout ce qui n'était pas David. »" },
  "First Principles": { visual: "🔬🧱", title: "Revenir aux Briques de Base", detail: "Elon Musk utilise cette méthode d'Aristote : décomposer un problème jusqu'aux vérités fondamentales indiscutables, puis reconstruire. SpaceX est né ainsi : « Les matériaux d'une fusée coûtent 2% du prix final. Pourquoi ne pas construire nous-mêmes ? »" },
  "Cercle de compétence": { visual: "⭕🎯", title: "Connais tes Limites", detail: "Buffett dessine un cercle autour de ce qu'il comprend vraiment et refuse d'investir en dehors. L'important n'est pas la taille du cercle, mais de savoir exactement OÙ est la frontière." },
  "Second-Order Thinking": { visual: "♟️🔗", title: "Et Ensuite ?", detail: "Niveau 1 : « Si je fais X, il se passe Y. » Niveau 2 : « Et si Y se passe, alors Z, W, V… ». Les conséquences des conséquences sont souvent l'inverse de l'effet initial. C'est ce qui sépare un bon décideur d'un excellent." },
  "Pareto": { visual: "📊📐", title: "La Loi du 80/20", detail: "Vilfredo Pareto observe en 1896 que 20% des Italiens possèdent 80% des terres. Ce ratio se retrouve partout : 20% de tes clients = 80% de ton CA, 20% de tes efforts = 80% des résultats. Identifie ce 20% et concentre-toi dessus." },
  "Parkinson": { visual: "⏰📏", title: "Le Travail s'Étire", detail: "Parkinson écrit dans The Economist (1955) : « Une vieille dame peut passer une journée entière à envoyer une carte postale. » Solution : impose-toi des deadlines courtes et artificielles. Le travail se comprimera." },
  "Deep Work": { visual: "🧠🔒", title: "La Concentration Profonde", detail: "Cal Newport : dans l'économie du savoir, la capacité de se concentrer sans distraction pendant de longues périodes est le nouveau superpouvoir. 4h de Deep Work > 8h de travail fragmenté par les notifications." },
  "Kairos": { visual: "⏳✨", title: "Le Temps Opportun", detail: "Les Grecs avaient 2 mots pour le temps : Chronos (le temps qui passe, quantitatif) et Kairos (le bon moment, qualitatif). Savoir QUAND agir est souvent plus important que savoir QUOI faire." },
  "Essentialism": { visual: "🎯✂️", title: "Moins mais Mieux", detail: "Greg McKeown : « Si tu ne choisis pas, quelqu'un d'autre choisira pour toi. » L'essentialiste dit NON à 95% des opportunités pour pouvoir dire un OUI absolu aux 5% qui comptent vraiment." },
  "Coût d'opportunité": { visual: "⚖️🚪", title: "Chaque Oui est un Non", detail: "Chaque heure passée sur Netflix est une heure qui n'est pas investie dans ton projet. Chaque euro dépensé en restaurant est un euro qui ne compose pas en bourse. Le vrai prix d'une chose, c'est ce à quoi tu renonces." },
  "Temps composé": { visual: "📈🌱", title: "L'Effet Boule de Neige", detail: "1% d'amélioration par jour pendant un an = 37× meilleur (1.01³⁶⁵ = 37.78). 1% de dégradation par jour = presque zéro (0.99³⁶⁵ = 0.03). Les petits choix quotidiens ont un impact exponentiel sur le long terme." },
  "Matrice d'Eisenhower": { visual: "📋🔲", title: "4 Quadrants", detail: "Urgent+Important → FAIS-LE maintenant. Important+Pas urgent → PLANIFIE-LE. Urgent+Pas important → DÉLÈGUE-LE. Ni urgent ni important → ÉLIMINE-LE. La plupart des gens passent trop de temps en Q3 (urgent mais pas important).", diagram: ["🔴 Urgent+Important → FAIRE", "🟢 Important → PLANIFIER", "🟡 Urgent seul → DÉLÉGUER", "⚫ Ni l'un ni l'autre → ÉLIMINER"], diagramType: "grid" },
  "Growth Mindset": { visual: "🧩🌱", title: "Fixe vs Croissance", detail: "Carol Dweck : les gens avec un état d'esprit FIXE croient que le talent est inné. Ceux avec un état d'esprit de CROISSANCE croient que tout s'apprend par l'effort. La différence ? Les seconds progressent réellement.", diagram: ["Fixe 🧊 « Je suis nul »", "Croissance 🌱 « Je ne sais pas ENCORE »"], diagramType: "vs" },
  "Kaizen": { visual: "🌱📅", title: "1% Chaque Jour", detail: "Après la guerre, Toyota transforme ses usines avec un principe simple : chaque employé, chaque jour, améliore un tout petit détail. Résultat : Toyota devient le constructeur le plus fiable au monde. Le Kaizen, c'est l'inverse de la révolution — c'est l'évolution." },
  "Shoshin": { visual: "👶🌟", title: "L'Esprit du Débutant", detail: "Shunryū Suzuki : « Dans l'esprit du débutant, il y a beaucoup de possibilités. Dans l'esprit de l'expert, il y en a peu. » L'expertise peut devenir un piège si elle ferme ton esprit aux nouvelles idées." },
  "Feynman Technique": { visual: "👨‍🏫📝", title: "Expliquer pour Comprendre", detail: "4 étapes : 1) Choisis un concept, 2) Explique-le à un enfant de 12 ans, 3) Identifie les trous dans ton explication, 4) Simplifie encore. Si tu ne peux pas l'expliquer simplement, tu ne le comprends pas vraiment." },
  "T-Shaped Skills": { visual: "🔧📊", title: "Le Profil en T", detail: "La barre horizontale du T = connaissances larges dans beaucoup de domaines. La barre verticale = expertise profonde dans un domaine. Les personnes en T sont les plus précieuses : elles communiquent avec tout le monde et excellent dans leur spécialité." },
  "Zone proximale de développement": { visual: "🎚️🎯", title: "Le Sweet Spot", detail: "Vygotski identifie 3 zones : ce que tu sais faire seul (trop facile), ce que tu peux faire avec aide (zone proximale = apprentissage optimal), ce qui est hors de portée (trop dur). Vise toujours la zone du milieu." },
  "Deliberate Practice": { visual: "🏋️🎯", title: "La Pratique Intentionnelle", detail: "Ericsson a montré que 10 000 heures ne suffisent pas : c'est 10 000 heures de pratique DÉLIBÉRÉE. Ça veut dire : travailler sur ses FAIBLESSES, avec un FEEDBACK constant, en sortant de sa zone de confort." },
  "Spacing Effect": { visual: "🗓️🧠", title: "Espacer pour Retenir", detail: "Ebbinghaus (1885) : 10 sessions de 5 min espacées sur 10 jours > 1 session de 50 min. Le cerveau consolide les souvenirs pendant le sommeil entre les sessions. C'est le principe derrière Anki et les flashcards espacées." },
  "Barbell Strategy": { visual: "🏋️⚖️", title: "90% Sûr / 10% Fou", detail: "Taleb : mets 90% de tes actifs dans des placements ultra-sûrs (obligations d'État) et 10% dans des paris ultra-risqués (startups). Jamais de « risque moyen » au milieu. Ainsi, tu ne peux pas perdre plus de 10% mais tu as un potentiel de gain illimité." },
  "FU Money": { visual: "🖕💰", title: "La Liberté Financière", detail: "Le montant exact varie selon ton mode de vie, mais le concept est simple : avoir assez d'argent pour pouvoir dire non à tout patron, client ou situation qui ne te convient pas. C'est acheter sa LIBERTÉ, pas des objets." },
  "Optionalité": { visual: "🃏📈", title: "Créer des Options", detail: "Taleb : la meilleure stratégie est de créer des situations où tu as beaucoup à gagner et peu à perdre. Chaque compétence apprise, chaque contact noué, chaque petit projet lancé crée une OPTION sur le futur." },
  "Value Investing": { visual: "🔎💎", title: "Acheter Sous la Valeur", detail: "Benjamin Graham : le marché est un partenaire émotif (Mr. Market) qui propose chaque jour des prix différents. Parfois il est déprimé et vend trop bas. C'est là qu'il faut acheter. Warren Buffett est devenu milliardaire avec cette philosophie." },
  "Moats": { visual: "🏰🛡️", title: "Les Douves Économiques", detail: "Buffett cherche des entreprises avec des « douves » : effet de réseau (Facebook), marque forte (Coca-Cola), coûts de changement (Apple), avantage de coût (Walmart). Plus la douve est large, plus l'entreprise est protégée." },
  "Sunk Cost": { visual: "🕳️🧠", title: "L'Argent Perdu est Perdu", detail: "Tu restes 2h de plus dans un mauvais film parce que tu as payé le billet. Tu gardes un vêtement que tu ne portes pas parce qu'il était cher. La question rationnelle n'est jamais « combien j'ai déjà investi ? » mais « est-ce que ça en vaut la peine À PARTIR DE MAINTENANT ? »" },
  "Skin in the Game": { visual: "🎰⚖️", title: "Assumer ses Risques", detail: "Taleb : on ne devrait jamais écouter les conseils de quelqu'un qui n'assume pas les conséquences de ses recommandations. Un chirurgien qui opère ses propres enfants, un chef qui mange sa propre cuisine — c'est le Skin in the Game." },
  "Ubuntu": { visual: "🤝🌍", title: "Je suis car Nous sommes", detail: "Desmond Tutu : « Une personne avec Ubuntu est ouverte et disponible pour les autres car elle a la certitude qu'elle fait partie d'un ensemble plus vaste. » Cette philosophie a été au cœur de la réconciliation post-apartheid en Afrique du Sud." },
  "Nombre de Dunbar": { visual: "👥🔢", title: "Les Cercles de Relations", detail: "Robin Dunbar : notre cerveau ne peut gérer que ~150 relations significatives. Structure en couches : ~5 intimes (amour, meilleur ami), ~15 proches (confiance profonde), ~50 amis (dîner), ~150 connaissances (mariage).", diagram: ["5 intimes 💕", "15 proches 🤝", "50 amis 👋", "150 connaissances 👥"], diagramType: "circles" },
  "Vulnérabilité": { visual: "💗🔓", title: "Oser se Montrer", detail: "Brené Brown après 12 ans de recherche : la vulnérabilité n'est pas de la faiblesse, c'est notre mesure la plus précise du courage. Les leaders, les créateurs, les amants — ceux qui marquent le monde osent montrer qui ils sont vraiment." },
  "Réciprocité": { visual: "🎁🔁", title: "Donner pour Recevoir", detail: "Cialdini : la réciprocité est le plus puissant des 6 principes d'influence. Un serveur qui offre un bonbon avec l'addition reçoit 23% de pourboire en plus. Donner en premier, sans attendre, crée un élan naturel de retour." },
  "Radical Candor": { visual: "💬❤️", title: "Vérité + Bienveillance", detail: "Kim Scott dessine 2 axes : « Care Personally » (se soucier) et « Challenge Directly » (dire la vérité). Les 2 ensemble = Radical Candor. Seulement gentil = manipulation. Seulement franc = agression." },
  "Miroir social": { visual: "🪞👤", title: "Tu es ce que les Autres Voient", detail: "Charles Cooley (1902) : on se construit en imaginant comment les autres nous perçoivent. Tu deviens littéralement ce que tu crois que les autres pensent de toi. D'où l'importance de bien choisir son entourage." },
  "Théorie de l'attachement": { visual: "👶🔗", title: "L'Enfance Programme l'Amour", detail: "Bowlby a identifié 4 styles : Sécure (confiance), Anxieux (peur de l'abandon), Évitant (peur de l'intimité), Désorganisé (chaos). Ton style se forme avant 2 ans et influence tes relations amoureuses toute ta vie — mais il peut évoluer." },
  "Hygge": { visual: "🕯️☕", title: "Le Confort à la Danoise", detail: "Bougies, couverture en laine, chocolat chaud, amis proches, cheminée. Le Hygge est l'art danois de créer une atmosphère chaleureuse et conviviale. Le Danemark est régulièrement classé pays le plus heureux du monde." },
  "Flow": { visual: "🌊🧠", title: "La Zone Optimale", detail: "Csikszentmihalyi identifie 8 conditions : but clair, feedback immédiat, équilibre défi/compétence, concentration totale, perte de la conscience de soi, distorsion du temps, sensation de contrôle, activité intrinsèquement gratifiante." },
  "Lagom": { visual: "⚖️🇸🇪", title: "Juste ce qu'il Faut", detail: "Du vieux norrois « laget om » (autour du groupe) — chacun prend sa juste part. Ni trop ambitieux ni trop modeste. Ni trop riche ni trop pauvre. La Suède incarne ce principe : modération et équilibre en tout." },
  "Sisu": { visual: "❄️🇫🇮", title: "La Force Intérieure Finlandaise", detail: "Pendant la Guerre d'Hiver (1939), 300 000 Finlandais ont résisté à 1 million de Soviétiques. Le Sisu, c'est cette force qui surgit quand on a dépassé ses limites. Au-delà du courage, au-delà de la résilience — une détermination quasi irrationnelle." },
  "Niksen": { visual: "☁️💤", title: "Ne Rien Faire", detail: "Dans un monde obsédé par la productivité, les Néerlandais pratiquent le Niksen : s'asseoir et regarder par la fenêtre. Sans but. Sans culpabilité. La recherche montre que c'est dans ces moments que le cerveau résout ses problèmes les plus complexes." },
  "Mono no aware": { visual: "🌸🍂", title: "Les Cerisiers qui Tombent", detail: "Les Japonais célèbrent le Hanami (contemplation des cerisiers en fleur) justement PARCE QUE les fleurs ne durent qu'une semaine. C'est l'éphémère qui crée la beauté. Mono no aware = la conscience tendre de l'impermanence." },
  "Meraki": { visual: "🎨💫", title: "Mettre son Âme", detail: "Mot grec sans traduction exacte : faire quelque chose avec tellement de passion et d'amour qu'on y laisse une part de soi. Qu'il s'agisse de cuisiner, coder, jardiner ou écrire — le Meraki transforme le banal en art." },
  "Hormesis": { visual: "🧊💪", title: "Le Stress qui Renforce", detail: "Petite dose de poison = le corps se renforce. Bain froid → meilleur système immunitaire. Jeûne intermittent → autophagie cellulaire. Exercice intense → muscles plus forts. Le confort permanent rend fragile." },
  "Friluftsliv": { visual: "🏔️🌲", title: "La Vie en Plein Air", detail: "Ibsen invente le mot en 1859. Les Scandinaves ne considèrent pas la nature comme un loisir mais comme un MODE DE VIE. Pas de « mauvais temps », seulement de « mauvais vêtements ». 96% des Norvégiens pratiquent le friluftsliv." },
  "OODA Loop": { visual: "🔄⚡", title: "La Boucle du Pilote de Chasse", detail: "Le colonel John Boyd : la victoire va à celui qui traverse le cycle Observer → Orienter → Décider → Agir plus VITE que l'adversaire. Utilisé par les militaires, les traders et les startups.", diagram: ["Observer 👀", "Orienter 🧭", "Décider 🧠", "Agir ⚡"], diagramType: "flow" },
  "Pre-mortem": { visual: "🔮💀", title: "L'Autopsie Préventive", detail: "Gary Klein : avant le lancement, réunis l'équipe et dis « Le projet a échoué. Pourquoi ? » Les gens sont plus créatifs pour imaginer les causes d'un échec passé (imaginaire) que pour anticiper les risques futurs." },
  "Satisficing": { visual: "✅😌", title: "Assez Bien = Bien", detail: "Herbert Simon (Nobel 1978) : chercher la décision PARFAITE coûte plus en temps et en stress que de choisir la première option « assez bonne ». Les maximiseurs sont paradoxalement moins satisfaits que les satisficers." },
  "Commitment Device": { visual: "🔒⛵", title: "Brûler les Bateaux", detail: "Hernán Cortés brûle ses navires pour empêcher ses soldats de fuir. Ulysse se fait attacher au mât. Tu donnes 100€ à un ami : s'il ne reçoit pas la preuve que tu as fait du sport, il les garde. Rendre l'abandon coûteux." },
  "Biais d'action": { visual: "⚡🏃", title: "Bouger Puis Ajuster", detail: "Les gardiens de football plongent à gauche ou à droite 94% du temps, alors que rester au centre arrêterait 33% des tirs. Pourquoi ? Parce que « ne rien faire » semble pire que « faire quelque chose ». Parfois, c'est un atout. Parfois, un piège." },
  "Regret Minimization": { visual: "👴🔮", title: "Le Test des 80 Ans", detail: "Bezos en 1994 hésite à quitter son job à Wall Street pour créer Amazon. Il s'imagine à 80 ans : « Est-ce que je regretterai de ne pas avoir essayé ? » La réponse était évidemment oui. Il démissionne le lendemain." },
  "Two-Minute Rule": { visual: "⏱️✅", title: "Moins de 2 Min ? Fais-le.", detail: "David Allen (Getting Things Done) : si une tâche prend moins de 2 minutes, la faire IMMÉDIATEMENT coûte moins cher en énergie mentale que de l'organiser, la planifier et la reporter. Ça élimine l'encombrement mental." },
  "Décisions réversibles": { visual: "🚪🔄", title: "Portes à Sens Unique vs Double Sens", detail: "Bezos chez Amazon : les décisions « Type 2 » (réversibles) doivent être prises vite, par de petites équipes. Les décisions « Type 1 » (irréversibles, comme vendre l'entreprise) méritent une analyse profonde. La plupart des décisions sont Type 2." },
  "Default Effect": { visual: "⚙️🧲", title: "Le Pouvoir du Défaut", detail: "En Autriche (opt-out), 99% des gens sont donneurs d'organes. En Allemagne voisine (opt-in), 12%. Même culture, même éducation. La seule différence : le choix par défaut. Conçois tes environnements avec de bons défauts." },
  "Impermanence": { visual: "🌀🌊", title: "Anicca — Tout Change", detail: "Le Bouddha observe que TOUT est impermanent : les sensations, les pensées, les relations, la vie elle-même. La souffrance vient de s'accrocher à ce qui change. Le lâcher-prise n'est pas de l'indifférence — c'est de l'amour sans attachement." },
  "Yin et Yang": { visual: "☯️🌓", title: "Les Opposés Complémentaires", detail: "Le point blanc dans le noir (et inversement) rappelle que chaque force contient le germe de son opposé. Lumière et ombre, masculin et féminin, action et repos ne sont pas en guerre — ils se complètent et se transforment l'un en l'autre." },
  "Absurdisme": { visual: "🪨😄", title: "Il Faut Imaginer Sisyphe Heureux", detail: "Camus dans Le Mythe de Sisyphe : l'univers n'a pas de sens inhérent, et c'est libérateur. Face à l'absurde, 3 réponses : le suicide (non), la foi (un saut), ou la révolte joyeuse (oui). Créer son propre sens malgré l'absurde." },
  "Lindy Effect": { visual: "📜⏳", title: "Le Vieux Survivra", detail: "Taleb : un livre publié depuis 100 ans a plus de chances d'être lu dans 100 ans qu'un best-seller de cette année. Une technologie vieille de 1000 ans (le livre, le vélo) survivra plus longtemps qu'une technologie de 5 ans." },
  "Hanlon's Razor": { visual: "🪒😅", title: "Pas de Malveillance", detail: "Ton collègue ne t'a pas inclus dans l'email ? Ce n'est probablement pas un complot — il a juste oublié. Ce rasoir réduit la paranoïa et améliore les relations : attribuer à la bêtise avant d'attribuer à la méchanceté." },
  "Effet papillon": { visual: "🦋🌪️", title: "Petites Causes, Grands Effets", detail: "Lorenz (1963) arrondit un nombre de 0.506127 à 0.506 dans sa simulation météo. Résultat : la prévision à long terme diverge complètement. D'où la métaphore : un battement d'ailes de papillon au Brésil peut déclencher une tornade au Texas." },
  "Paradoxe de la tolérance": { visual: "🛡️⚖️", title: "Tolérer l'Intolérance ?", detail: "Popper (1945) : si une société est tolérante sans limite, sa capacité de tolérance sera détruite par les intolérants. Conclusion : pour préserver la tolérance, il faut être intolérant envers l'intolérance elle-même." },
  "Apophénie": { visual: "🔭👻", title: "Des Motifs Fantômes", detail: "Voir le visage de la Vierge Marie sur un toast grillé. Trouver un « pattern » dans les cours de bourse. Le cerveau humain est une machine à trouver des motifs — même là où il n'y en a pas. En être conscient protège des fausses certitudes." },
  "Enso": { visual: "⭕🖌️", title: "Le Cercle Ouvert", detail: "En calligraphie zen, l'Enso est tracé d'un seul coup de pinceau, en un seul souffle. Il n'est jamais parfaitement fermé — l'ouverture symbolise que rien n'est jamais terminé, que l'imperfection EST la perfection." },
  "Amor Mundi": { visual: "🌍❤️", title: "L'Amour du Monde", detail: "Hannah Arendt : l'engagement envers le monde n'est pas un sacrifice mais un amour. Participer à la vie publique, protéger l'espace commun, agir pour les autres — c'est l'Amor Mundi." },
};

// Fallback for concepts not in details
function getDetail(q) {
  const key = q.concept || q.answer || q.intrus;
  return conceptDetails[key] || { visual: "📚", title: key, detail: `Concept clé dans la catégorie ${q.theme}. Explore le lien ci-dessous pour en savoir plus.` };
}

const allQuestions = [
  // SENS & DIRECTION
  { theme:"Sens & Direction",level:1,type:"qcm",question:"L'Ikigai est un concept originaire de quel pays ?",options:["Chine","Japon","Corée du Sud"],answer:"Japon",concept:"Ikigai",url:"https://fr.wikipedia.org/wiki/Ikigai"},
  { theme:"Sens & Direction",level:1,type:"qcm",question:"Que signifie « Memento Mori » ?",options:["Souviens-toi que tu vas mourir","Vis le moment présent","Aime ton destin"],answer:"Souviens-toi que tu vas mourir",concept:"Memento Mori",url:"https://fr.wikipedia.org/wiki/Memento_mori"},
  { theme:"Sens & Direction",level:1,type:"qcm",question:"Qui a popularisé le concept d'Amor Fati ?",options:["Platon","Friedrich Nietzsche","Socrate"],answer:"Friedrich Nietzsche",concept:"Amor Fati",url:"https://fr.wikipedia.org/wiki/Amor_fati"},
  { theme:"Sens & Direction",level:1,type:"qcm",question:"L'Eudaimonia selon Aristote, c'est :",options:["La recherche du plaisir","L'épanouissement par l'excellence","La méditation profonde"],answer:"L'épanouissement par l'excellence",concept:"Eudaimonia",url:"https://fr.wikipedia.org/wiki/Eud%C3%A9monisme"},
  { theme:"Sens & Direction",level:2,type:"jesuis",question:"Je suis l'intersection entre ce que tu aimes, ce en quoi tu excelles, ce dont le monde a besoin et ce pour quoi tu peux être payé.",answer:"Ikigai",acceptAlt:["ikigai"],url:"https://fr.wikipedia.org/wiki/Ikigai"},
  { theme:"Sens & Direction",level:2,type:"jesuis",question:"Je t'invite non pas à accepter le destin, mais à l'aimer passionnément. Nietzsche m'a nommé.",answer:"Amor Fati",acceptAlt:["amor fati"],url:"https://fr.wikipedia.org/wiki/Amor_fati"},
  { theme:"Sens & Direction",level:2,type:"jesuis",question:"Concept hindou : vivre en alignement avec ton devoir profond et ta nature véritable.",answer:"Dharma",acceptAlt:["dharma"],url:"https://fr.wikipedia.org/wiki/Dharma"},
  { theme:"Sens & Direction",level:2,type:"jesuis",question:"La finalité, le but ultime de chaque chose selon Aristote.",answer:"Telos",acceptAlt:["telos"],url:"https://fr.wikipedia.org/wiki/T%C3%A9l%C3%A9ologie"},
  { theme:"Sens & Direction",level:3,type:"intrus",items:["Ikigai","Dharma","Telos","Kintsugi"],intrus:"Kintsugi",explain:"Ikigai, Dharma et Telos portent sur le sens et la direction. Kintsugi est un concept de résilience.",url:"https://fr.wikipedia.org/wiki/Kintsugi",concept:"Kintsugi"},
  { theme:"Sens & Direction",level:3,type:"intrus",items:["Amor Fati","Memento Mori","Eudaimonia","Kaizen"],intrus:"Kaizen",explain:"Amor Fati, Memento Mori et Eudaimonia traitent du sens de l'existence. Kaizen est une méthode d'amélioration continue.",url:"https://fr.wikipedia.org/wiki/Kaizen",concept:"Kaizen"},
  // RÉSILIENCE
  { theme:"Résilience",level:1,type:"qcm",question:"Le Kintsugi est l'art japonais de :",options:["Méditer en silence","Réparer avec de l'or","Plier le papier"],answer:"Réparer avec de l'or",concept:"Kintsugi",url:"https://fr.wikipedia.org/wiki/Kintsugi"},
  { theme:"Résilience",level:1,type:"qcm",question:"L'antifragilité selon Nassim Taleb, c'est :",options:["Résister au stress","Éviter le stress","Se renforcer sous le stress"],answer:"Se renforcer sous le stress",concept:"Antifragilité",url:"https://fr.wikipedia.org/wiki/Antifragilit%C3%A9"},
  { theme:"Résilience",level:1,type:"qcm",question:"Qui a théorisé le concept de Grit ?",options:["Angela Duckworth","Carol Dweck","Martin Seligman"],answer:"Angela Duckworth",concept:"Grit",url:"https://angeladuckworth.com/grit-book/"},
  { theme:"Résilience",level:1,type:"qcm",question:"L'impuissance apprise est un concept de :",options:["Nassim Taleb","Martin Seligman","John Keats"],answer:"Martin Seligman",concept:"Impuissance apprise",url:"https://fr.wikipedia.org/wiki/Impuissance_apprise"},
  { theme:"Résilience",level:2,type:"jesuis",question:"Je vais au-delà de la résilience : je me nourris du chaos pour devenir plus fort. Nassim Taleb m'a inventé.",answer:"Antifragilité",acceptAlt:["antifragilite","antifragilité"],url:"https://fr.wikipedia.org/wiki/Antifragilit%C3%A9"},
  { theme:"Résilience",level:2,type:"jesuis",question:"L'art de trouver la beauté dans l'imperfection et l'éphémère, hérité de la cérémonie du thé.",answer:"Wabi-sabi",acceptAlt:["wabi-sabi","wabi sabi"],url:"https://fr.wikipedia.org/wiki/Wabi-sabi"},
  { theme:"Résilience",level:2,type:"jesuis",question:"Capacité de tolérer l'incertitude sans chercher frénétiquement des réponses. John Keats m'a nommé.",answer:"Negative Capability",acceptAlt:["negative capability","capacité négative"],url:"https://en.wikipedia.org/wiki/Negative_capability"},
  { theme:"Résilience",level:2,type:"jesuis",question:"La persévérance passionnée sur le long terme. Angela Duckworth a montré que je bats le talent pur.",answer:"Grit",acceptAlt:["grit"],url:"https://angeladuckworth.com/grit-book/"},
  { theme:"Résilience",level:3,type:"intrus",items:["Antifragilité","Grit","Wabi-sabi","Flow"],intrus:"Flow",explain:"Antifragilité, Grit et Wabi-sabi sont des concepts de résilience. Le Flow est un état de bien-être.",url:"https://fr.wikipedia.org/wiki/Flow_(psychologie)",concept:"Flow"},
  { theme:"Résilience",level:3,type:"intrus",items:["Kintsugi","Stoïcisme","Negative Capability","Pareto"],intrus:"Pareto",explain:"Kintsugi, Stoïcisme et Negative Capability aident face aux épreuves. Pareto est un principe de productivité.",url:"https://fr.wikipedia.org/wiki/Principe_de_Pareto",concept:"Pareto"},
  // PENSÉE
  { theme:"Pensée",level:1,type:"qcm",question:"Le rasoir d'Occam privilégie :",options:["L'explication la plus simple","L'explication la plus complexe","L'explication la plus ancienne"],answer:"L'explication la plus simple",concept:"Rasoir d'Occam",url:"https://fr.wikipedia.org/wiki/Rasoir_d%27Ockham"},
  { theme:"Pensée",level:1,type:"qcm",question:"L'effet Dunning-Kruger décrit le fait que :",options:["Tout le monde se juge correctement","Les novices sous-estiment leur ignorance","Les experts surestiment leurs compétences"],answer:"Les novices sous-estiment leur ignorance",concept:"Dunning-Kruger",url:"https://fr.wikipedia.org/wiki/Effet_Dunning-Kruger"},
  { theme:"Pensée",level:1,type:"qcm",question:"Le biais de confirmation, c'est :",options:["Ignorer toutes les informations","Chercher les infos qui confirment nos croyances","Chercher les infos qui contredisent nos croyances"],answer:"Chercher les infos qui confirment nos croyances",concept:"Biais de confirmation",url:"https://fr.wikipedia.org/wiki/Biais_de_confirmation"},
  { theme:"Pensée",level:1,type:"qcm",question:"« La carte n'est pas le territoire » est de :",options:["Charlie Munger","Alfred Korzybski","Nassim Taleb"],answer:"Alfred Korzybski",concept:"Carte vs Territoire",url:"https://fr.wikipedia.org/wiki/La_carte_n%27est_pas_le_territoire"},
  { theme:"Pensée",level:2,type:"jesuis",question:"Au lieu de chercher le succès, imagine comment échouer puis évite ça. Charlie Munger m'a popularisé.",answer:"Inversion",acceptAlt:["inversion"],url:"https://en.wikipedia.org/wiki/Charlie_Munger"},
  { theme:"Pensée",level:2,type:"jesuis",question:"Reformuler l'argument adverse dans sa version la plus forte avant de le critiquer.",answer:"Steel-manning",acceptAlt:["steel-manning","steelmanning","steel man"],url:"https://en.wikipedia.org/wiki/Straw_man#Steelmanning"},
  { theme:"Pensée",level:2,type:"jesuis",question:"Progresser en enlevant plutôt qu'en ajoutant. Mon nom latin signifie « par la négation ».",answer:"Via Negativa",acceptAlt:["via negativa"],url:"https://fr.wikipedia.org/wiki/Th%C3%A9ologie_n%C3%A9gative"},
  { theme:"Pensée",level:2,type:"jesuis",question:"Décomposer un problème jusqu'à ses vérités fondamentales. Aristote m'a inventé.",answer:"First Principles",acceptAlt:["first principles","premiers principes"],url:"https://en.wikipedia.org/wiki/First_principle"},
  { theme:"Pensée",level:3,type:"intrus",items:["Rasoir d'Occam","Biais de confirmation","Inversion","Hygge"],intrus:"Hygge",explain:"Occam, le biais de confirmation et l'Inversion sont des outils de pensée. Le Hygge est un art de vivre danois.",url:"https://fr.wikipedia.org/wiki/Hygge",concept:"Hygge"},
  { theme:"Pensée",level:3,type:"intrus",items:["First Principles","Dunning-Kruger","Steel-manning","Ubuntu"],intrus:"Ubuntu",explain:"First Principles, Dunning-Kruger et Steel-manning sont des cadres de pensée. Ubuntu est une philosophie de lien social.",url:"https://fr.wikipedia.org/wiki/Ubuntu_(philosophie)",concept:"Ubuntu"},
  // TEMPS
  { theme:"Temps",level:1,type:"qcm",question:"Le principe de Pareto indique que :",options:["80% des résultats viennent de 20% des efforts","Il faut travailler 80h pour 20h de repos","80% du travail se fait en 20% du temps"],answer:"80% des résultats viennent de 20% des efforts",concept:"Pareto",url:"https://fr.wikipedia.org/wiki/Principe_de_Pareto"},
  { theme:"Temps",level:1,type:"qcm",question:"La loi de Parkinson affirme que :",options:["Le temps guérit tout","Le travail s'étend pour remplir le temps disponible","Le travail urgent est toujours important"],answer:"Le travail s'étend pour remplir le temps disponible",concept:"Parkinson",url:"https://fr.wikipedia.org/wiki/Loi_de_Parkinson"},
  { theme:"Temps",level:1,type:"qcm",question:"Le Deep Work a été popularisé par :",options:["Cal Newport","Tim Ferriss","Greg McKeown"],answer:"Cal Newport",concept:"Deep Work",url:"https://calnewport.com/deep-work-rules-for-focused-success-in-a-distracted-world/"},
  { theme:"Temps",level:1,type:"qcm",question:"Kairos dans la philosophie grecque représente :",options:["L'éternité","Le bon moment","Le temps linéaire"],answer:"Le bon moment",concept:"Kairos",url:"https://fr.wikipedia.org/wiki/Kairos"},
  { theme:"Temps",level:2,type:"jesuis",question:"Faire moins mais mieux, dire non à presque tout. Greg McKeown m'a théorisé.",answer:"Essentialism",acceptAlt:["essentialism","essentialisme"],url:"https://gregmckeown.com/books/essentialism/"},
  { theme:"Temps",level:2,type:"jesuis",question:"Coût invisible : quand tu dis oui à quelque chose, tu dis non à autre chose.",answer:"Coût d'opportunité",acceptAlt:["cout d'opportunite","coût d'opportunité","opportunity cost"],url:"https://fr.wikipedia.org/wiki/Co%C3%BBt_d%27opportunit%C3%A9"},
  { theme:"Temps",level:2,type:"jesuis",question:"De petits efforts quotidiens produisent des résultats exponentiels. Darren Hardy m'a théorisé.",answer:"Temps composé",acceptAlt:["temps compose","temps composé","compound effect"],url:"https://en.wikipedia.org/wiki/The_Compound_Effect"},
  { theme:"Temps",level:2,type:"jesuis",question:"Matrice à 4 quadrants : urgence × importance. Un président américain m'a inspiré.",answer:"Matrice d'Eisenhower",acceptAlt:["matrice d'eisenhower","eisenhower"],url:"https://fr.wikipedia.org/wiki/Matrice_d%27Eisenhower"},
  { theme:"Temps",level:3,type:"intrus",items:["Deep Work","Loi de Parkinson","Essentialism","Antifragilité"],intrus:"Antifragilité",explain:"Deep Work, Parkinson et Essentialism optimisent le temps. L'Antifragilité parle de se renforcer sous le stress.",url:"https://fr.wikipedia.org/wiki/Antifragilit%C3%A9",concept:"Antifragilité"},
  { theme:"Temps",level:3,type:"intrus",items:["Pareto","Kairos","Matrice d'Eisenhower","Value Investing"],intrus:"Value Investing",explain:"Pareto, Kairos et Eisenhower gèrent le temps. Value Investing est une stratégie financière.",url:"https://fr.wikipedia.org/wiki/Investissement_dans_la_valeur",concept:"Value Investing"},
  // CROISSANCE
  { theme:"Croissance",level:1,type:"qcm",question:"Le Growth Mindset de Carol Dweck affirme que :",options:["L'intelligence ne change jamais","Les capacités se développent par l'effort","Le talent est inné et fixe"],answer:"Les capacités se développent par l'effort",concept:"Growth Mindset",url:"https://en.wikipedia.org/wiki/Mindset#Fixed_and_growth_mindset"},
  { theme:"Croissance",level:1,type:"qcm",question:"Le Kaizen est un concept de :",options:["Compétition intense","Amélioration continue par petits pas","Amélioration radicale"],answer:"Amélioration continue par petits pas",concept:"Kaizen",url:"https://fr.wikipedia.org/wiki/Kaizen"},
  { theme:"Croissance",level:1,type:"qcm",question:"La technique Feynman consiste à :",options:["Lire le plus vite possible","Mémoriser par répétition","Expliquer simplement pour vérifier sa compréhension"],answer:"Expliquer simplement pour vérifier sa compréhension",concept:"Feynman Technique",url:"https://fr.wikipedia.org/wiki/Richard_Feynman"},
  { theme:"Croissance",level:1,type:"qcm",question:"Le Spacing Effect d'Ebbinghaus montre que :",options:["L'apprentissage espacé est plus efficace","Le bachotage est la meilleure méthode","Il faut tout apprendre en une fois"],answer:"L'apprentissage espacé est plus efficace",concept:"Spacing Effect",url:"https://fr.wikipedia.org/wiki/Effet_d%27espacement"},
  { theme:"Croissance",level:2,type:"jesuis",question:"Aborder chaque sujet avec la curiosité d'un débutant, même expert. Shunryū Suzuki m'a popularisé.",answer:"Shoshin",acceptAlt:["shoshin","esprit du débutant"],url:"https://en.wikipedia.org/wiki/Shoshin"},
  { theme:"Croissance",level:2,type:"jesuis",question:"Profil en forme de lettre : expertise profonde + connaissances larges.",answer:"T-Shaped Skills",acceptAlt:["t-shaped skills","t-shaped"],url:"https://en.wikipedia.org/wiki/T-shaped_skills"},
  { theme:"Croissance",level:2,type:"jesuis",question:"Le sweet spot d'apprentissage entre trop facile et trop dur. Vygotski m'a conceptualisé.",answer:"Zone proximale de développement",acceptAlt:["zone proximale","zpd"],url:"https://fr.wikipedia.org/wiki/Zone_proximale_de_d%C3%A9veloppement"},
  { theme:"Croissance",level:2,type:"jesuis",question:"S'entraîner avec intention, feedback, et hors de sa zone de confort. Anders Ericsson m'a étudiée.",answer:"Deliberate Practice",acceptAlt:["deliberate practice","pratique délibérée"],url:"https://en.wikipedia.org/wiki/Practice_(learning_method)#Deliberate_practice"},
  { theme:"Croissance",level:3,type:"intrus",items:["Kaizen","Growth Mindset","Shoshin","Barbell Strategy"],intrus:"Barbell Strategy",explain:"Kaizen, Growth Mindset et Shoshin = croissance. Barbell Strategy = gestion de risque financier.",url:"https://en.wikipedia.org/wiki/Barbell_strategy",concept:"Barbell Strategy"},
  { theme:"Croissance",level:3,type:"intrus",items:["Deliberate Practice","Feynman Technique","Spacing Effect","Sunk Cost"],intrus:"Sunk Cost",explain:"Deliberate Practice, Feynman et Spacing Effect = apprentissage. Sunk Cost = biais de décision financière.",url:"https://fr.wikipedia.org/wiki/Co%C3%BBt_irr%C3%A9cup%C3%A9rable",concept:"Sunk Cost"},
  // ARGENT
  { theme:"Argent",level:1,type:"qcm",question:"Les intérêts composés sont souvent attribués (à tort) à :",options:["Léonard de Vinci","Albert Einstein","Isaac Newton"],answer:"Albert Einstein",concept:"Intérêts composés",url:"https://fr.wikipedia.org/wiki/Int%C3%A9r%C3%AAts_compos%C3%A9s"},
  { theme:"Argent",level:1,type:"qcm",question:"« Skin in the Game » de Nassim Taleb signifie :",options:["Assumer les conséquences de ses décisions","Jouer pour gagner","Prendre des risques extrêmes"],answer:"Assumer les conséquences de ses décisions",concept:"Skin in the Game",url:"https://fr.wikipedia.org/wiki/Jouer_sa_peau"},
  { theme:"Argent",level:1,type:"qcm",question:"Les « Moats » de Warren Buffett sont :",options:["Des dettes stratégiques","Des avantages compétitifs durables","Des investissements court terme"],answer:"Des avantages compétitifs durables",concept:"Moats",url:"https://en.wikipedia.org/wiki/Economic_moat"},
  { theme:"Argent",level:1,type:"qcm",question:"Le biais du Sunk Cost nous pousse à :",options:["Toujours recommencer à zéro","Continuer à cause de l'investissement passé","Abandonner trop vite"],answer:"Continuer à cause de l'investissement passé",concept:"Sunk Cost",url:"https://fr.wikipedia.org/wiki/Co%C3%BBt_irr%C3%A9cup%C3%A9rable"},
  { theme:"Argent",level:2,type:"jesuis",question:"Ultra-prudent sur 90%, ultra-agressif sur 10%. Rien au milieu. Taleb m'a théorisé.",answer:"Barbell Strategy",acceptAlt:["barbell strategy","barbell"],url:"https://en.wikipedia.org/wiki/Barbell_strategy"},
  { theme:"Argent",level:2,type:"jesuis",question:"Le montant d'argent qui te permet de dire non à tout ce qui ne te convient pas.",answer:"FU Money",acceptAlt:["fu money"],url:"https://jlcollinsnh.com/stock-series/"},
  { theme:"Argent",level:2,type:"jesuis",question:"Créer des situations avec beaucoup de gain potentiel et peu de risque de perte.",answer:"Optionalité",acceptAlt:["optionalite","optionalité"],url:"https://en.wikipedia.org/wiki/Real_options_valuation"},
  { theme:"Argent",level:2,type:"jesuis",question:"Philosophie de Benjamin Graham : acheter à un prix inférieur à la valeur réelle.",answer:"Value Investing",acceptAlt:["value investing"],url:"https://fr.wikipedia.org/wiki/Investissement_dans_la_valeur"},
  { theme:"Argent",level:3,type:"intrus",items:["Moats","Optionalité","Barbell Strategy","Wabi-sabi"],intrus:"Wabi-sabi",explain:"Moats, Optionalité et Barbell = stratégies financières. Wabi-sabi = esthétique japonaise de l'imperfection.",url:"https://fr.wikipedia.org/wiki/Wabi-sabi",concept:"Wabi-sabi"},
  { theme:"Argent",level:3,type:"intrus",items:["Value Investing","Skin in the Game","FU Money","Niksen"],intrus:"Niksen",explain:"Value Investing, Skin in the Game et FU Money = argent. Niksen = l'art de ne rien faire.",url:"https://en.wikipedia.org/wiki/Niksen",concept:"Niksen"},
  // RELATIONS
  { theme:"Relations",level:1,type:"qcm",question:"Ubuntu signifie :",options:["La force est dans l'union","Je suis parce que nous sommes","Je pense donc je suis"],answer:"Je suis parce que nous sommes",concept:"Ubuntu",url:"https://fr.wikipedia.org/wiki/Ubuntu_(philosophie)"},
  { theme:"Relations",level:1,type:"qcm",question:"Selon Dunbar, combien de relations peut-on maintenir ?",options:["Environ 150","Environ 50","Environ 500"],answer:"Environ 150",concept:"Nombre de Dunbar",url:"https://fr.wikipedia.org/wiki/Nombre_de_Dunbar"},
  { theme:"Relations",level:1,type:"qcm",question:"Les 5 langages de l'amour ont été théorisés par :",options:["John Bowlby","Brené Brown","Gary Chapman"],answer:"Gary Chapman",concept:"5 Langages",url:"https://fr.wikipedia.org/wiki/Les_Cinq_Langages_de_l%27amour"},
  { theme:"Relations",level:1,type:"qcm",question:"Radical Candor de Kim Scott consiste à :",options:["Éviter tout conflit","Dire la vérité avec bienveillance","Être brutal dans ses feedbacks"],answer:"Dire la vérité avec bienveillance",concept:"Radical Candor",url:"https://www.radicalcandor.com/"},
  { theme:"Relations",level:2,type:"jesuis",question:"Notre identité se construit à travers le regard des autres. Charles Cooley m'a nommé.",answer:"Miroir social",acceptAlt:["miroir social","soi miroir"],url:"https://fr.wikipedia.org/wiki/Soi_miroir"},
  { theme:"Relations",level:2,type:"jesuis",question:"Le courage de montrer qui on est vraiment. Brené Brown m'a étudiée pendant 20 ans.",answer:"Vulnérabilité",acceptAlt:["vulnerabilite","vulnérabilité"],url:"https://brenebrown.com/book/daring-greatly/"},
  { theme:"Relations",level:2,type:"jesuis",question:"Quand quelqu'un te donne quelque chose, tu veux rendre la pareille. Cialdini m'a étudié.",answer:"Réciprocité",acceptAlt:["reciprocite","réciprocité"],url:"https://fr.wikipedia.org/wiki/Influence_et_manipulation"},
  { theme:"Relations",level:2,type:"jesuis",question:"Nos relations d'enfance façonnent nos relations adultes. John Bowlby m'a créée.",answer:"Théorie de l'attachement",acceptAlt:["théorie de l'attachement","attachement"],url:"https://fr.wikipedia.org/wiki/Th%C3%A9orie_de_l%27attachement"},
  { theme:"Relations",level:3,type:"intrus",items:["Ubuntu","Réciprocité","Vulnérabilité","Deep Work"],intrus:"Deep Work",explain:"Ubuntu, Réciprocité et Vulnérabilité = connexion humaine. Deep Work = concentration individuelle.",url:"https://calnewport.com/deep-work-rules-for-focused-success-in-a-distracted-world/",concept:"Deep Work"},
  { theme:"Relations",level:3,type:"intrus",items:["Nombre de Dunbar","Miroir social","Radical Candor","Amor Fati"],intrus:"Amor Fati",explain:"Dunbar, Miroir social et Radical Candor = dynamiques relationnelles. Amor Fati = concept existentiel.",url:"https://fr.wikipedia.org/wiki/Amor_fati",concept:"Amor Fati"},
  // BIEN-ÊTRE
  { theme:"Bien-être",level:1,type:"qcm",question:"Le Hygge est un concept originaire de :",options:["Danemark","Suède","Norvège"],answer:"Danemark",concept:"Hygge",url:"https://fr.wikipedia.org/wiki/Hygge"},
  { theme:"Bien-être",level:1,type:"qcm",question:"L'état de Flow selon Csikszentmihalyi est :",options:["Un état de méditation","Un état de relaxation profonde","Un état de concentration totale"],answer:"Un état de concentration totale",concept:"Flow",url:"https://fr.wikipedia.org/wiki/Flow_(psychologie)"},
  { theme:"Bien-être",level:1,type:"qcm",question:"Lagom (Suède) signifie :",options:["Ni trop, ni trop peu","Le bonheur absolu","Vivre vite"],answer:"Ni trop, ni trop peu",concept:"Lagom",url:"https://fr.wikipedia.org/wiki/Lagom"},
  { theme:"Bien-être",level:1,type:"qcm",question:"Sisu (Finlande) représente :",options:["L'art de ne rien faire","Le plaisir des petites choses","Une force intérieure extraordinaire"],answer:"Une force intérieure extraordinaire",concept:"Sisu",url:"https://en.wikipedia.org/wiki/Sisu"},
  { theme:"Bien-être",level:2,type:"jesuis",question:"Art néerlandais de ne rien faire sans culpabilité, laisser l'esprit vagabonder.",answer:"Niksen",acceptAlt:["niksen"],url:"https://en.wikipedia.org/wiki/Niksen"},
  { theme:"Bien-être",level:2,type:"jesuis",question:"Douce mélancolie face à la beauté éphémère. Motoori Norinaga m'a conceptualisé.",answer:"Mono no aware",acceptAlt:["mono no aware"],url:"https://fr.wikipedia.org/wiki/Mono_no_aware"},
  { theme:"Bien-être",level:2,type:"jesuis",question:"Concept grec : mettre son âme et sa créativité dans tout ce qu'on fait.",answer:"Meraki",acceptAlt:["meraki"],url:"https://en.wiktionary.org/wiki/%CE%BC%CE%B5%CF%81%CE%AC%CE%BA%CE%B9"},
  { theme:"Bien-être",level:2,type:"jesuis",question:"De petites doses de stress (froid, jeûne, exercice) renforcent le corps.",answer:"Hormesis",acceptAlt:["hormesis","hormèse"],url:"https://fr.wikipedia.org/wiki/Horm%C3%A8se"},
  { theme:"Bien-être",level:3,type:"intrus",items:["Hygge","Lagom","Flow","Inversion"],intrus:"Inversion",explain:"Hygge, Lagom et Flow = bien-être. L'Inversion = outil de pensée critique.",url:"https://en.wikipedia.org/wiki/Charlie_Munger",concept:"Inversion"},
  { theme:"Bien-être",level:3,type:"intrus",items:["Sisu","Friluftsliv","Meraki","Sunk Cost"],intrus:"Sunk Cost",explain:"Sisu, Friluftsliv et Meraki = art de vivre. Sunk Cost = biais de décision.",url:"https://fr.wikipedia.org/wiki/Co%C3%BBt_irr%C3%A9cup%C3%A9rable",concept:"Sunk Cost"},
  // DÉCISION
  { theme:"Décision",level:1,type:"qcm",question:"Le Regret Minimization Framework est de :",options:["Jeff Bezos","Bill Gates","Elon Musk"],answer:"Jeff Bezos",concept:"Regret Minimization",url:"https://en.wikipedia.org/wiki/Jeff_Bezos"},
  { theme:"Décision",level:1,type:"qcm",question:"OODA Loop signifie :",options:["Organiser, Optimiser, Développer, Analyser","Observer, Orienter, Décider, Agir","Ouvrir, Opérer, Diriger, Avancer"],answer:"Observer, Orienter, Décider, Agir",concept:"OODA Loop",url:"https://fr.wikipedia.org/wiki/Boucle_OODA"},
  { theme:"Décision",level:1,type:"qcm",question:"La Two-Minute Rule de David Allen :",options:["Attendre 2 min avant de décider","Si ça prend moins de 2 min, fais-le tout de suite","Méditer 2 min par jour"],answer:"Si ça prend moins de 2 min, fais-le tout de suite",concept:"Two-Minute Rule",url:"https://fr.wikipedia.org/wiki/Getting_Things_Done"},
  { theme:"Décision",level:1,type:"qcm",question:"Le Pre-mortem consiste à :",options:["Imaginer l'échec avant le projet","Célébrer les succès passés","Analyser un échec après coup"],answer:"Imaginer l'échec avant le projet",concept:"Pre-mortem",url:"https://en.wikipedia.org/wiki/Pre-mortem"},
  { theme:"Décision",level:2,type:"jesuis",question:"Deux types de décisions : réversibles (agis vite) et irréversibles (réfléchis). Bezos m'a formulé.",answer:"Décisions réversibles",acceptAlt:["decisions reversibles","décisions réversibles"],url:"https://en.wikipedia.org/wiki/Jeff_Bezos"},
  { theme:"Décision",level:2,type:"jesuis",question:"Je rends l'abandon plus coûteux que la persévérance. Thomas Schelling m'a théorisé.",answer:"Commitment Device",acceptAlt:["commitment device"],url:"https://en.wikipedia.org/wiki/Commitment_device"},
  { theme:"Décision",level:2,type:"jesuis",question:"« Assez bien » est souvent mieux que la perfection. Herbert Simon m'a inventé.",answer:"Satisficing",acceptAlt:["satisficing"],url:"https://fr.wikipedia.org/wiki/Satisficing"},
  { theme:"Décision",level:2,type:"jesuis",question:"Je pousse à agir et ajuster plutôt qu'à rester paralysé par l'analyse.",answer:"Biais d'action",acceptAlt:["biais d'action","action bias"],url:"https://en.wikipedia.org/wiki/Action_bias"},
  { theme:"Décision",level:3,type:"intrus",items:["OODA Loop","Pre-mortem","Satisficing","Ikigai"],intrus:"Ikigai",explain:"OODA, Pre-mortem et Satisficing = cadres de décision. Ikigai = sens de la vie.",url:"https://fr.wikipedia.org/wiki/Ikigai",concept:"Ikigai"},
  { theme:"Décision",level:3,type:"intrus",items:["Biais d'action","Commitment Device","Two-Minute Rule","Hormesis"],intrus:"Hormesis",explain:"Biais d'action, Commitment Device et Two-Minute Rule = décision. Hormesis = biologie.",url:"https://fr.wikipedia.org/wiki/Horm%C3%A8se",concept:"Hormesis"},
  // SAGESSE
  { theme:"Sagesse",level:1,type:"qcm",question:"Le Yin et Yang est un concept issu de :",options:["Le shintoïsme","Le taoïsme","Le bouddhisme"],answer:"Le taoïsme",concept:"Yin et Yang",url:"https://fr.wikipedia.org/wiki/Yin_et_yang"},
  { theme:"Sagesse",level:1,type:"qcm",question:"L'absurdisme est associé à :",options:["Friedrich Nietzsche","Albert Camus","Jean-Paul Sartre"],answer:"Albert Camus",concept:"Absurdisme",url:"https://fr.wikipedia.org/wiki/Absurdisme"},
  { theme:"Sagesse",level:1,type:"qcm",question:"Rasoir de Hanlon : ne pas attribuer à la malveillance ce qui s'explique par :",options:["La cupidité","L'ignorance ou la maladresse","La paresse"],answer:"L'ignorance ou la maladresse",concept:"Hanlon's Razor",url:"https://fr.wikipedia.org/wiki/Rasoir_de_Hanlon"},
  { theme:"Sagesse",level:1,type:"qcm",question:"L'effet papillon est un concept de :",options:["La biologie","La théorie du chaos","La physique quantique"],answer:"La théorie du chaos",concept:"Effet papillon",url:"https://fr.wikipedia.org/wiki/Effet_papillon"},
  { theme:"Sagesse",level:2,type:"jesuis",question:"Tout change, et la souffrance vient de s'accrocher. Mon nom en pali est Anicca.",answer:"Impermanence",acceptAlt:["impermanence","anicca"],url:"https://fr.wikipedia.org/wiki/Impermanence"},
  { theme:"Sagesse",level:2,type:"jesuis",question:"Plus une idée a survécu longtemps, plus elle durera. Nassim Taleb m'a popularisé.",answer:"Lindy Effect",acceptAlt:["lindy effect","effet lindy"],url:"https://en.wikipedia.org/wiki/Lindy_effect"},
  { theme:"Sagesse",level:2,type:"jesuis",question:"Cercle incomplet d'un seul trait en calligraphie zen. Perfection dans l'inachevé.",answer:"Enso",acceptAlt:["enso","ensō"],url:"https://en.wikipedia.org/wiki/Ens%C5%8D"},
  { theme:"Sagesse",level:2,type:"jesuis",question:"Une société tolérante doit être intolérante envers l'intolérance. Karl Popper m'a formulé.",answer:"Paradoxe de la tolérance",acceptAlt:["paradoxe de la tolerance","paradoxe de la tolérance"],url:"https://fr.wikipedia.org/wiki/Paradoxe_de_la_tol%C3%A9rance"},
  { theme:"Sagesse",level:3,type:"intrus",items:["Yin et Yang","Absurdisme","Impermanence","Kaizen"],intrus:"Kaizen",explain:"Yin et Yang, Absurdisme et Impermanence = sagesses profondes. Kaizen = méthode pratique.",url:"https://fr.wikipedia.org/wiki/Kaizen",concept:"Kaizen"},
  { theme:"Sagesse",level:3,type:"intrus",items:["Effet papillon","Apophénie","Paradoxe de la tolérance","Grit"],intrus:"Grit",explain:"Effet papillon, Apophénie et Paradoxe de la tolérance = réflexions sur le monde. Grit = persévérance individuelle.",url:"https://angeladuckworth.com/grit-book/",concept:"Grit"},
];

// ===== UTILS =====
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function selectQuestions(count){const themes=Object.keys(catColors),pt=Math.floor(count/themes.length),sel=[];for(const t of themes){const tq=allQuestions.filter(q=>q.theme===t);const e=shuffle(tq.filter(q=>q.level===1)),m=shuffle(tq.filter(q=>q.level===2)),h=shuffle(tq.filter(q=>q.level===3));let ec,mc,hc;if(pt<=3){ec=1;mc=1;hc=1;}else if(pt<=5){ec=2;mc=2;hc=1;}else{ec=4;mc=4;hc=2;}sel.push(...e.slice(0,ec),...m.slice(0,mc),...h.slice(0,hc));}return shuffle(sel).slice(0,count);}
function norm(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();}
function lev(a,b){const m=a.length,n=b.length,d=Array.from({length:m+1},()=>Array(n+1).fill(0));for(let i=0;i<=m;i++)d[i][0]=i;for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]!==b[j-1]?1:0));return d[m][n];}
function checkAns(u,ans,alts=[]){const un=norm(u);if(!un)return false;const ts=[norm(ans),...(alts||[]).map(norm)];for(const t of ts){if(un===t)return true;if(t.includes(un)&&un.length>=3)return true;if(un.includes(t)&&t.length>=3)return true;const mx=t.length<=5?1:t.length<=10?2:3;if(lev(un,t)<=mx)return true;}return false;}
function genId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
const lvlLabels={1:"Facile",2:"Moyen",3:"Expert"};const lvlEmojis={1:"🟢",2:"🟡",3:"🔴"};const lvlPts={1:1,2:2,3:3};

// ===== DETAIL CARD COMPONENT =====
function DetailCard({ q }) {
  const [open, setOpen] = useState(false);
  const d = getDetail(q);
  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      width: "100%", marginTop: 10, padding: "12px 16px", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.15)",
      background: "rgba(255,255,255,0.03)", color: "#aaa", fontSize: 13, cursor: "pointer", textAlign: "center",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s"
    }}>
      <span style={{ fontSize: 18 }}>{d.visual.split("")[0]}</span>
      <span>Détails & visuel explicatif</span>
      <span style={{ fontSize: 11 }}>▼</span>
    </button>
  );
  return (
    <div style={{
      marginTop: 10, borderRadius: 14, overflow: "hidden",
      background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
      border: `1px solid ${catColors[q.theme]}33`, animation: "fadeIn 0.4s ease"
    }}>
      {/* Header */}
      <div onClick={() => setOpen(false)} style={{
        padding: "14px 16px", cursor: "pointer",
        background: `${catColors[q.theme]}15`,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 24 }}>{d.visual}</span>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{d.title}</span>
        </div>
        <span style={{ color: "#666", fontSize: 11 }}>▲ fermer</span>
      </div>
      {/* Body */}
      <div style={{ padding: "16px" }}>
        <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.6, margin: 0 }}>{d.detail}</p>
        {/* Diagram if exists */}
        {d.diagram && (
          <div style={{ marginTop: 14 }}>
            {d.diagramType === "flow" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 0, alignItems: "center" }}>
                {d.diagram.map((item, i) => (
                  <div key={i}>
                    <div style={{
                      background: `${catColors[q.theme]}18`, border: `1px solid ${catColors[q.theme]}40`,
                      borderRadius: 10, padding: "8px 16px", fontSize: 13, color: "#ddd", textAlign: "center", minWidth: 180
                    }}>{item}</div>
                    {i < d.diagram.length - 1 && <div style={{ textAlign: "center", color: "#555", fontSize: 16, lineHeight: "20px" }}>↓</div>}
                  </div>
                ))}
              </div>
            )}
            {d.diagramType === "levels" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {d.diagram.map((item, i) => (
                  <div key={i} style={{
                    background: `rgba(255,255,255,${0.03 + i * 0.03})`,
                    border: `1px solid rgba(255,255,255,${0.08 + i * 0.05})`,
                    borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#ddd"
                  }}>{item}</div>
                ))}
              </div>
            )}
            {d.diagramType === "4circles" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {d.diagram.map((item, i) => (
                  <div key={i} style={{
                    background: `${["#e8453c","#f5a623","#2ecc71","#7b61ff"][i]}15`,
                    border: `1px solid ${["#e8453c","#f5a623","#2ecc71","#7b61ff"][i]}40`,
                    borderRadius: 10, padding: "10px", fontSize: 12, color: "#ddd", textAlign: "center"
                  }}>{item}</div>
                ))}
              </div>
            )}
            {d.diagramType === "grid" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {d.diagram.map((item, i) => (
                  <div key={i} style={{
                    background: `rgba(255,255,255,0.04)`, border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "8px 10px", fontSize: 12, color: "#ddd", textAlign: "center"
                  }}>{item}</div>
                ))}
              </div>
            )}
            {d.diagramType === "vs" && (
              <div style={{ display: "flex", gap: 8 }}>
                {d.diagram.map((item, i) => (
                  <div key={i} style={{
                    flex: 1, background: i === 0 ? "rgba(232,69,60,0.1)" : "rgba(46,204,113,0.1)",
                    border: `1px solid ${i === 0 ? "rgba(232,69,60,0.3)" : "rgba(46,204,113,0.3)"}`,
                    borderRadius: 10, padding: "12px", fontSize: 13, color: "#ddd", textAlign: "center"
                  }}>{item}</div>
                ))}
              </div>
            )}
            {d.diagramType === "circles" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                {d.diagram.map((item, i) => (
                  <div key={i} style={{
                    width: `${60 + i * 12}%`, background: `${catColors[q.theme]}${15 - i * 3}`,
                    border: `1px solid ${catColors[q.theme]}40`, borderRadius: 20,
                    padding: "6px 14px", fontSize: 12, color: "#ddd", textAlign: "center"
                  }}>{item}</div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Link */}
        {q.url && (
          <a href={q.url} target="_blank" rel="noopener noreferrer" style={{
            display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12,
            fontSize: 12, color: catColors[q.theme], textDecoration: "none"
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            En savoir plus sur {q.concept || q.answer || q.intrus}
          </a>
        )}
      </div>
    </div>
  );
}

export default function App(){
  const [screen,setScreen]=useState("home");
  const [questions,setQuestions]=useState([]);
  const [idx,setIdx]=useState(0);
  const [ans,setAns]=useState("");
  const [selOpt,setSelOpt]=useState(null);
  const [revealed,setRevealed]=useState(false);
  const [score,setScore]=useState(0);
  const [maxScore,setMaxScore]=useState(0);
  const [results,setResults]=useState([]);
  const [qCount,setQCount]=useState(0);
  const [lb,setLb]=useState([]);
  const [pName,setPName]=useState("");
  const [nameOk,setNameOk]=useState(false);
  const [pRank,setPRank]=useState(null);
  const [shuffledOpts,setShuffledOpts]=useState([]);
  const [shuffledIntrus,setShuffledIntrus]=useState([]);

  const loadLb=useCallback(async()=>{try{const stored=JSON.parse(localStorage.getItem("quiz_lb")||"[]");stored.sort((a,b)=>b.pct-a.pct||b.score-a.score);setLb(stored);}catch{setLb([]);}},[]); const prepQ=useCallback((q)=>{if(q.type==="qcm")setShuffledOpts(shuffle(q.options));if(q.type==="intrus")setShuffledIntrus(shuffle(q.items));},[]);
  const startQuiz=useCallback((c)=>{const qs=selectQuestions(c);setQCount(c);setQuestions(qs);setIdx(0);setScore(0);setMaxScore(0);setResults([]);setAns("");setSelOpt(null);setRevealed(false);setPName("");setNameOk(false);setPRank(null);if(qs[0])prepQ(qs[0]);setScreen("quiz");},[prepQ]);
  const q=questions[idx];
  const handleReveal=()=>{if(!q||revealed)return;setRevealed(true);if(q.type==="qcm"){const ok=selOpt===q.answer;setScore(s=>s+(ok?1:0));setMaxScore(m=>m+1);setResults(r=>[...r,{...q,userAnswer:selOpt,correct:ok,pts:ok?1:0}]);}else if(q.type==="jesuis"){const ok=checkAns(ans,q.answer,q.acceptAlt);setScore(s=>s+(ok?2:0));setMaxScore(m=>m+2);setResults(r=>[...r,{...q,userAnswer:ans,correct:ok,pts:ok?2:0}]);}else if(q.type==="intrus"){const ok=selOpt===q.intrus;setScore(s=>s+(ok?3:0));setMaxScore(m=>m+3);setResults(r=>[...r,{...q,userAnswer:selOpt,correct:ok,pts:ok?3:0,answer:q.intrus}]);}};
  const nextQ=()=>{if(idx+1>=questions.length){setScreen("results");loadLb();return;}const ni=idx+1;setIdx(ni);setAns("");setSelOpt(null);setRevealed(false);if(questions[ni])prepQ(questions[ni]);};
  const handleNameSubmit=async()=>{if(!pName.trim())return;setNameOk(true);const pct=maxScore>0?Math.round((score/maxScore)*100):0;const entry={name:pName.trim(),score,max:maxScore,pct,count:qCount,date:new Date().toISOString().slice(0,10),id:genId()};try{const stored2=JSON.parse(localStorage.getItem("quiz_lb")||"[]");stored2.push(entry);localStorage.setItem("quiz_lb",JSON.stringify(stored2));}catch{}await loadLb();const all=[...lb,entry].sort((a,b)=>b.pct-a.pct||b.score-a.score);setPRank(all.findIndex(e=>e.id===entry.id)+1);};
  const pct=maxScore>0?Math.round((score/maxScore)*100):0;const lastR=results.length>0?results[results.length-1]:null;

  // HOME
  if(screen==="home")return(<div style={S.ctn}><div style={{textAlign:"center",padding:"50px 24px 40px"}}><div style={{fontSize:56,marginBottom:8}}>🧠</div><h1 style={S.title}>Quiz des 100 Concepts</h1><p style={{color:"#999",fontSize:14,margin:"12px 0 36px",lineHeight:1.5}}>Teste tes connaissances sur les concepts les plus puissants</p><p style={{color:"#bbb",fontSize:14,marginBottom:16,fontWeight:600}}>Combien de questions ?</p>{[{n:30,e:"⚡",g:"linear-gradient(135deg,#2ecc71,#27ae60)",s:"~15 min"},{n:50,e:"🔥",g:"linear-gradient(135deg,#f5a623,#e8453c)",s:"~25 min"},{n:100,e:"🏆",g:"linear-gradient(135deg,#7b61ff,#e91e8f)",s:"~45 min"}].map(({n,e,g,s})=>(<button key={n} onClick={()=>startQuiz(n)} style={{display:"block",width:"100%",maxWidth:300,margin:"10px auto",padding:"16px 24px",borderRadius:14,border:"none",cursor:"pointer",background:g,color:"#fff",fontSize:17,fontWeight:700}}>{n} questions {e}<div style={{fontSize:12,fontWeight:400,opacity:.85,marginTop:4}}>{s}</div></button>))}<div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:20,maxWidth:320,margin:"32px auto 0",textAlign:"left"}}><p style={{color:"#aaa",fontSize:13,fontWeight:700,marginBottom:10}}>3 niveaux :</p><div style={{color:"#bbb",fontSize:13,lineHeight:2}}><div>🟢 <b>Facile</b> — QCM (1 pt)</div><div>🟡 <b>Moyen</b> — « Je suis... » (2 pts)</div><div>🔴 <b>Expert</b> — L'intrus (3 pts)</div></div></div></div></div>);

  // RESULTS
  if(screen==="results"){const grade=pct>=90?{e:"🏆",l:"Extraordinaire !",c:"#f5a623"}:pct>=75?{e:"🌟",l:"Excellent !",c:"#2ecc71"}:pct>=60?{e:"👏",l:"Très bien !",c:"#4ecdc4"}:pct>=40?{e:"💪",l:"Pas mal !",c:"#7b61ff"}:{e:"📚",l:"Continue !",c:"#e8453c"};const ts={};results.forEach(r=>{if(!ts[r.theme])ts[r.theme]={s:0,m:0};ts[r.theme].s+=r.pts;ts[r.theme].m+=lvlPts[r.level];});return(<div style={S.ctn}><div style={{textAlign:"center",padding:"36px 20px 16px"}}><div style={{fontSize:60,marginBottom:4}}>{grade.e}</div><h2 style={{color:grade.c,fontSize:24,fontWeight:800,margin:0}}>{grade.l}</h2><div style={{fontSize:52,fontWeight:800,color:"#fff",margin:"12px 0 2px"}}>{score}<span style={{fontSize:24,color:"#666"}}>/{maxScore} pts</span></div><div style={{fontSize:18,color:"#888",fontWeight:600}}>{pct}%</div></div><div style={{padding:"12px 16px 0"}}><div style={{background:"rgba(255,255,255,0.04)",borderRadius:14,padding:20}}><h3 style={{color:"#fff",fontSize:15,fontWeight:700,margin:"0 0 12px",textAlign:"center"}}>🏅 Classement</h3>{!nameOk?(<div><p style={{color:"#aaa",fontSize:13,marginBottom:10,textAlign:"center"}}>Entre ton nom :</p><div style={{display:"flex",gap:8}}><input type="text" value={pName} onChange={e=>setPName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleNameSubmit()} placeholder="Prénom..." maxLength={20} style={{flex:1,padding:"10px 14px",borderRadius:10,border:"1px solid #333",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:14,outline:"none"}}/><button onClick={handleNameSubmit} disabled={!pName.trim()} style={{padding:"10px 18px",borderRadius:10,border:"none",cursor:"pointer",background:pName.trim()?"linear-gradient(135deg,#7b61ff,#e8453c)":"rgba(255,255,255,0.08)",color:pName.trim()?"#fff":"#666",fontSize:14,fontWeight:700}}>OK</button></div></div>):(<div>{pRank&&<div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:14,color:"#aaa"}}>Tu es classé</div><div style={{fontSize:36,fontWeight:800,color:pRank<=3?"#f5a623":"#7b61ff"}}>{pRank<=3?["🥇","🥈","🥉"][pRank-1]:`#${pRank}`}</div><div style={{fontSize:13,color:"#888"}}>sur {lb.length} joueur{lb.length>1?"s":""}</div></div>}{lb.slice(0,15).map((e,i)=>{const isMe=e.name===pName.trim()&&e.score===score;return(<div key={i} style={{display:"flex",alignItems:"center",padding:"8px 10px",borderRadius:8,marginBottom:4,background:isMe?"rgba(123,97,255,0.15)":"transparent",border:isMe?"1px solid rgba(123,97,255,0.3)":"1px solid transparent"}}><span style={{width:28,fontSize:14,fontWeight:700,color:i<3?"#f5a623":"#666"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`}</span><span style={{flex:1,fontSize:14,color:isMe?"#fff":"#ccc",fontWeight:isMe?700:400}}>{e.name}</span><span style={{fontSize:14,fontWeight:700,color:e.pct>=75?"#2ecc71":e.pct>=50?"#f5a623":"#e8453c"}}>{e.pct}%</span><span style={{fontSize:12,color:"#666",marginLeft:6}}>{e.score}/{e.max}</span></div>);})}</div>)}</div></div><div style={{padding:"16px 16px 8px"}}><h3 style={{color:"#fff",fontSize:15,fontWeight:700,marginBottom:12}}>Par thème</h3>{Object.entries(ts).map(([t,d])=>{const tp=d.m>0?Math.round((d.s/d.m)*100):0;return(<div key={t} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#bbb",marginBottom:3}}><span style={{color:catColors[t],fontWeight:600}}>{t}</span><span>{d.s}/{d.m} ({tp}%)</span></div><div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:3}}><div style={{height:"100%",width:`${tp}%`,background:catColors[t],borderRadius:3,transition:"width 0.5s"}}/></div></div>);})}</div><div style={{padding:"8px 16px"}}><h3 style={{color:"#fff",fontSize:15,fontWeight:700,marginBottom:12}}>Détail</h3>{results.map((r,i)=>(<div key={i} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 12px",marginBottom:6,borderLeft:`3px solid ${r.correct?"#2ecc71":"#e8453c"}`}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontSize:12,color:"#888"}}>{lvlEmojis[r.level]} {r.answer||r.intrus}</span><span style={{fontSize:12,fontWeight:700,color:r.correct?"#2ecc71":"#e8453c"}}>{r.correct?`+${r.pts}pt${r.pts>1?"s":""}`:"0pt"}</span></div>{!r.correct&&<div style={{fontSize:12,color:"#666"}}>Ta réponse : <span style={{color:"#e8453c"}}>{r.userAnswer||"—"}</span></div>}{r.url&&<a href={r.url} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:catColors[r.theme],textDecoration:"none",marginTop:4,display:"inline-block"}}>📖 En savoir plus →</a>}</div>))}</div><div style={{padding:"20px 16px 40px",textAlign:"center"}}><button onClick={()=>setScreen("home")} style={{padding:"14px 32px",borderRadius:14,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#7b61ff,#e8453c)",color:"#fff",fontSize:16,fontWeight:700}}>Rejouer 🔄</button></div></div>);}

  // QUIZ
  if(!q)return null;const prog=((idx+1)/questions.length)*100;
  return(<div style={S.ctn}>
    <div style={{padding:"16px 16px 0"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span style={{color:"#888",fontSize:13}}>{idx+1}/{questions.length}</span><div style={{background:"linear-gradient(135deg,#7b61ff,#e8453c)",borderRadius:20,padding:"5px 14px",fontSize:15,fontWeight:800,color:"#fff",minWidth:50,textAlign:"center"}}>{score} <span style={{fontSize:11,fontWeight:400,opacity:.8}}>pts</span></div></div><div style={{height:4,background:"rgba(255,255,255,0.08)",borderRadius:2}}><div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#7b61ff,#e8453c)",borderRadius:2,transition:"width 0.3s"}}/></div></div>
    <div style={{padding:"20px 16px"}}><div style={{background:"rgba(255,255,255,0.04)",borderRadius:18,padding:"24px 20px",borderLeft:`4px solid ${catColors[q.theme]}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><span style={{fontSize:11,color:catColors[q.theme],fontWeight:700,background:`${catColors[q.theme]}22`,padding:"4px 10px",borderRadius:8}}>{q.theme}</span><span style={{fontSize:12,fontWeight:600,color:q.level===1?"#2ecc71":q.level===2?"#f5a623":"#e8453c"}}>{lvlEmojis[q.level]} {lvlLabels[q.level]} · {lvlPts[q.level]}pt{lvlPts[q.level]>1?"s":""}</span></div>
      <div style={{fontSize:11,color:"#555",textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontWeight:700}}>{q.type==="qcm"?"QCM":q.type==="jesuis"?"Devinette « Je suis... »":"🧩 Trouve l'intrus"}</div>

      {/* QCM */}
      {q.type==="qcm"&&<><p style={{color:"#fff",fontSize:17,lineHeight:1.5,fontWeight:500,margin:"0 0 20px"}}>{q.question}</p>{shuffledOpts.map((opt,i)=>{const isSel=selOpt===opt,isOk=revealed&&opt===q.answer,isBad=revealed&&isSel&&opt!==q.answer;return(<button key={i} onClick={()=>!revealed&&setSelOpt(opt)} disabled={revealed} style={{display:"block",width:"100%",textAlign:"left",padding:"14px 16px",marginBottom:8,borderRadius:12,boxSizing:"border-box",border:`2px solid ${isOk?"#2ecc71":isBad?"#e8453c":isSel?"#7b61ff":"rgba(255,255,255,0.1)"}`,background:isOk?"rgba(46,204,113,0.12)":isBad?"rgba(232,69,60,0.12)":isSel?"rgba(123,97,255,0.12)":"rgba(255,255,255,0.03)",color:"#ddd",fontSize:15,cursor:revealed?"default":"pointer",transition:"all 0.2s"}}><span style={{fontWeight:600,marginRight:8,color:"#888"}}>{String.fromCharCode(65+i)}.</span>{opt}{isOk&&" ✓"}{isBad&&" ✗"}</button>);})}</>}

      {/* JE SUIS */}
      {q.type==="jesuis"&&<><p style={{color:"#fff",fontSize:17,lineHeight:1.5,fontWeight:500,margin:"0 0 20px"}}>{q.question}</p><input type="text" value={ans} onChange={e=>setAns(e.target.value)} placeholder="Le nom du concept..." disabled={revealed} onKeyDown={e=>e.key==="Enter"&&!revealed&&ans.trim()&&handleReveal()} autoComplete="off" spellCheck="false" style={{width:"100%",padding:"14px 16px",borderRadius:12,boxSizing:"border-box",border:`2px solid ${revealed?(lastR?.correct?"#2ecc71":"#e8453c"):"rgba(255,255,255,0.1)"}`,background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:16,outline:"none",fontWeight:500}}/><p style={{fontSize:11,color:"#555",marginTop:6}}>💡 L'orthographe approximative est acceptée</p></>}

      {/* INTRUS */}
      {q.type==="intrus"&&<><p style={{color:"#fff",fontSize:16,lineHeight:1.5,fontWeight:500,margin:"0 0 6px"}}>Lequel <b style={{color:"#e8453c"}}>n'appartient pas</b> au groupe ?</p><p style={{color:"#666",fontSize:12,marginBottom:16}}>3 partagent un thème. Un seul est l'intrus.</p><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{shuffledIntrus.map((item,i)=>{const isSel=selOpt===item,isOk=revealed&&item===q.intrus,isBad=revealed&&isSel&&item!==q.intrus,isGood=revealed&&!isSel&&item!==q.intrus;return(<button key={i} onClick={()=>!revealed&&setSelOpt(item)} disabled={revealed} style={{padding:"16px 12px",borderRadius:14,boxSizing:"border-box",textAlign:"center",border:`2px solid ${isOk?"#e8453c":isBad?"#888":isSel?"#7b61ff":isGood?"rgba(46,204,113,0.3)":"rgba(255,255,255,0.1)"}`,background:isOk?"rgba(232,69,60,0.15)":isBad?"rgba(255,255,255,0.05)":isSel?"rgba(123,97,255,0.12)":isGood?"rgba(46,204,113,0.06)":"rgba(255,255,255,0.03)",color:isOk?"#e8453c":isGood?"#2ecc71":"#ddd",fontSize:14,fontWeight:600,cursor:revealed?"default":"pointer",transition:"all 0.2s"}}>{item}{isOk&&<div style={{fontSize:11,marginTop:4,fontWeight:400}}>← L'intrus</div>}</button>);})}</div>{revealed&&<div style={{marginTop:14,padding:"12px 16px",borderRadius:10,background:lastR?.correct?"rgba(46,204,113,0.1)":"rgba(232,69,60,0.1)",border:`1px solid ${lastR?.correct?"#2ecc71":"#e8453c"}`}}><div style={{fontSize:14,color:lastR?.correct?"#2ecc71":"#e8453c",fontWeight:700}}>{lastR?.correct?"✓ Bien trouvé ! +3 pts":"✗ Raté !"}</div><p style={{fontSize:13,color:"#bbb",lineHeight:1.5,margin:"6px 0 0"}}>{q.explain}</p></div>}</>}

      {/* Revealed jesuis */}
      {revealed&&q.type==="jesuis"&&<div style={{marginTop:12,padding:"14px 16px",borderRadius:10,background:lastR?.correct?"rgba(46,204,113,0.12)":"rgba(232,69,60,0.12)",border:`1px solid ${lastR?.correct?"#2ecc71":"#e8453c"}`}}><div style={{fontSize:14,color:lastR?.correct?"#2ecc71":"#e8453c",fontWeight:700}}>{lastR?.correct?`✓ +${lastR.pts} pts`:"✗ Mauvaise réponse"}</div><div style={{fontSize:14,color:"#ccc",marginTop:6}}>Réponse : <b style={{color:"#fff"}}>{q.answer}</b></div></div>}

      {/* ===== DETAIL CARD — appears after reveal ===== */}
      {revealed && <DetailCard q={q} />}

    </div></div>

    {/* Action */}
    <div style={{padding:"0 16px 40px"}}>
      {!revealed?(<button onClick={handleReveal} disabled={q.type==="jesuis"?!ans.trim():!selOpt} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",cursor:"pointer",background:(q.type==="jesuis"?ans.trim():selOpt)?"linear-gradient(135deg,#7b61ff,#e8453c)":"rgba(255,255,255,0.08)",color:(q.type==="jesuis"?ans.trim():selOpt)?"#fff":"#666",fontSize:16,fontWeight:700,transition:"all 0.2s"}}>Valider ✓</button>):(<button onClick={nextQ} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",cursor:"pointer",background:"linear-gradient(135deg,#2ecc71,#27ae60)",color:"#fff",fontSize:16,fontWeight:700}}>{idx+1>=questions.length?"Voir les résultats 🏆":"Suivante →"}</button>)}
    </div>
    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>);
}

const S={ctn:{minHeight:"100vh",background:"linear-gradient(145deg,#0d0d1a 0%,#1a1a2e 50%,#16213e 100%)",color:"#e0e0e0",fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:480,margin:"0 auto"},title:{fontSize:28,fontWeight:800,margin:0,background:"linear-gradient(135deg,#f5a623,#e8453c,#7b61ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}};
