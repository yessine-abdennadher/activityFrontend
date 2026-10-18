/**
 * notificationTemplates.ts
 * Fichier centralisé des modèles et variations de notifications pour ActivityTN.
 *
 * Concepts clés :
 * - ZÉRO EMOJI : Textes épurés, clairs et professionnels.
 * - Plusieurs variantes créatives (titre + corps) pour chaque créneau clé de la semaine.
 * - Sélection aléatoire (random) pour éviter la lassitude de l'utilisateur.
 * - Idées tunisiennes authentiques (Soirées live, Brunch mer, Sunset rooftops, Nature & Rando, Afterwork cosy, Promos pro, KharjaBot).
 * - Support trilingue complet (Français, Arabe dialectal tunisien chaleureux, Anglais).
 */

export interface LocalizedText {
  fr: string;
  ar: string;
  en: string;
}

export interface NotificationMessageVariant {
  id: string;
  titles: LocalizedText;
  bodies: LocalizedText;
}

export interface NotificationSlot {
  id: string;
  category: 'nightlife' | 'brunch' | 'sunset' | 'adventure' | 'afterwork' | 'promos' | 'kharjabot';
  channelId: 'outings_events' | 'promos_deals' | 'reminders_weekend';
  triggerDayOfWeek: number; // 1 = Dimanche, 2 = Lundi, 3 = Mardi, 4 = Mercredi, 5 = Jeudi, 6 = Vendredi, 7 = Samedi
  triggerHour: number;
  triggerMinute: number;
  variants: NotificationMessageVariant[];
}

export const NOTIFICATION_SLOTS: NotificationSlot[] = [
  // =========================================================================
  // 1. VENDREDI SOIR (18h30) : Nightlife, Musique Live & Ambiance Week-end
  // =========================================================================
  {
    id: 'friday_nightlife',
    category: 'nightlife',
    channelId: 'outings_events',
    triggerDayOfWeek: 6, // Vendredi
    triggerHour: 18,
    triggerMinute: 30,
    variants: [
      {
        id: 'friday_dj_live',
        titles: {
          fr: 'Prêt pour le week-end en Tunisie ?',
          ar: 'سهرتك الليلة جاهزة ؟',
          en: 'Ready for the weekend in Tunisia?',
        },
        bodies: {
          fr: 'Découvrez les meilleures soirées DJ, acoustiques et lounges animés près de chez vous sur ActivityTN !',
          ar: 'اكتشف أفضل السهرات، الحفلات والمقاهي الحية القريبة منك على تطبيق ActivityTN !',
          en: 'Explore top DJ live sets, acoustic nights, and lively lounges near you on ActivityTN!',
        },
      },
      {
        id: 'friday_chill_music',
        titles: {
          fr: 'Vendredi soir : Où est la meilleure ambiance ?',
          ar: 'وين الجو الليلة ؟ سهرات حية تستنى فيك',
          en: 'Friday night: Where is the best vibe?',
        },
        bodies: {
          fr: 'Live bands, sets acoustiques et terrasses animées vous attendent pour décompresser en beauté.',
          ar: 'عروض حية، قعدات مزيانة وأجواء رايقة باش تفوج على روحك بعد جمعة خدمة.',
          en: 'Live acoustic bands and vibrant lounges await to kickstart your weekend.',
        },
      },
      {
        id: 'friday_rooftop_party',
        titles: {
          fr: 'Soirée chill ou dancefloor ce soir ?',
          ar: 'قعدة هادية ولا سهريّة مميزة ؟',
          en: 'Chill lounge or lively dancefloor tonight?',
        },
        bodies: {
          fr: 'De La Marsa à Hammamet, découvrez les spots les plus branchés sélectionnés pour vous.',
          ar: 'من المرسى للحمامات، تلقى أحسن البلايص المختارة ليك على ActivityTN !',
          en: 'From La Marsa to Hammamet, discover the trendiest hotspots curated for you.',
        },
      },
    ],
  },

  // =========================================================================
  // 2. SAMEDI MATIN (10h30) : Brunch, Café ensoleillé & Vue Mer
  // =========================================================================
  {
    id: 'saturday_brunch',
    category: 'brunch',
    channelId: 'reminders_weekend',
    triggerDayOfWeek: 7, // Samedi
    triggerHour: 10,
    triggerMinute: 30,
    variants: [
      {
        id: 'saturday_coffee_sea',
        titles: {
          fr: "Envie d'une pause café ou brunch ?",
          ar: 'قهوة باهية ولا فطور صباح عالبحر ؟',
          en: 'Fancy a morning coffee or brunch?',
        },
        bodies: {
          fr: 'Terrasses ensoleillées avec vue mer et cafés calmes à explorer dès maintenant.',
          ar: 'تراسات مشمسة مطلة عالبحر ومقاهي هادية تستنى فيك لاكتشافها اليوم.',
          en: 'Sunny seaside terraces and peaceful coffee spots to explore today.',
        },
      },
      {
        id: 'saturday_croissant_fresh',
        titles: {
          fr: "Le brunch du samedi n'attend pas !",
          ar: 'برانش السبت يبدا توا !',
          en: 'Saturday brunch is calling!',
        },
        bodies: {
          fr: 'Jus frais, viennoiseries et formules gourmandes : faites-vous plaisir ce matin.',
          ar: 'عصير طازج، فطور تونسي مقوم.. دلل روحك اليوم في أحسن البلايص.',
          en: 'Fresh juice, warm pastries, and hearty brunch platters: treat yourself this morning.',
        },
      },
      {
        id: 'saturday_sidibou_view',
        titles: {
          fr: 'Un café face aux vagues ce matin ?',
          ar: 'قعدة قدام الموج في نهار مشمس',
          en: 'A morning coffee facing the waves?',
        },
        bodies: {
          fr: 'Sidi Bou Saïd, La Goulette, Bizerte ou Sousse : trouvez le spot parfait pour vous ressourcer.',
          ar: 'سيدي بوسعيد، حلق الوادي، بنزرت ولا سوسة.. ألقى البلاصة اللي ترتحلك بالك.',
          en: 'Sidi Bou Said, La Goulette, or Sousse: find the perfect scenic spot to recharge.',
        },
      },
    ],
  },

  // =========================================================================
  // 3. SAMEDI FIN D'APRÈS-MIDI (17h45) : Golden Hour, Sunset & Rooftops
  // =========================================================================
  {
    id: 'saturday_sunset',
    category: 'sunset',
    channelId: 'reminders_weekend',
    triggerDayOfWeek: 7, // Samedi
    triggerHour: 17,
    triggerMinute: 45,
    variants: [
      {
        id: 'sunset_golden_hour',
        titles: {
          fr: 'Golden Hour : Prêt pour le coucher de soleil ?',
          ar: 'وقت الغروب يحلى مع قعدة مزيانة',
          en: 'Golden Hour: Ready for the sunset?',
        },
        bodies: {
          fr: 'Rooftops perchés et terrasses panoramiques pour admirer les couleurs du crépuscule.',
          ar: 'أسطح مطلة وبلايص بانورامية باش تتفرج في الغروب وتعيش لحظات ما تتنساش.',
          en: 'Scenic rooftops and panoramic terraces to watch twilight unfold with friends.',
        },
      },
      {
        id: 'sunset_tea_mint',
        titles: {
          fr: 'Thé aux pignons face au soleil couchant ?',
          ar: 'تاي بالبندق مع نسمة هادية ؟',
          en: 'Mint tea with pine nuts at sunset?',
        },
        bodies: {
          fr: "Prenez de la hauteur et profitez d'une vue imprenable sur la baie avant la nuit.",
          ar: 'اطلع لأعلى نقطة واستمتع بمنظر البحر وريحة الياسمين قبل ما تظلم الدنيا.',
          en: 'Head up high and enjoy a breathtaking view over the bay before evening falls.',
        },
      },
    ],
  },

  // =========================================================================
  // 4. DIMANCHE MATIN (11h00) : Plein Air, Aventure, Sensations & Famille
  // =========================================================================
  {
    id: 'sunday_adventure',
    category: 'adventure',
    channelId: 'outings_events',
    triggerDayOfWeek: 1, // Dimanche
    triggerHour: 11,
    triggerMinute: 0,
    variants: [
      {
        id: 'sunday_outdoor_nature',
        titles: {
          fr: 'Échappée belle et Grand Air',
          ar: 'خروجة عائلية في الهواء الطلق',
          en: 'Outdoor Adventure and Family Trips',
        },
        bodies: {
          fr: "Karting, quad, randonnée ou équitation : faites le plein d'énergie avant la semaine !",
          ar: 'كارتينغ، كواد، ركوب خيل أو جولة طبيعية : عيش تجربة مميزة مع العائلة والأصحاب !',
          en: 'Karting, quad, hiking, or horseback riding: recharge your energy today!',
        },
      },
      {
        id: 'sunday_adrenaline_rush',
        titles: {
          fr: "Envie d'adrénaline ou de grand air ?",
          ar: 'أجواء حماس ومغامرة تستنى فيك !',
          en: 'In the mood for thrill and fresh air?',
        },
        bodies: {
          fr: "Défiez vos amis sur circuit de karting ou partez en balade équestre en pleine forêt.",
          ar: 'تحدى أصحابك في حلبة الكارتينغ ولا عيش جولة فروسية ساحرة وسط الطبيعة.',
          en: 'Race your friends on a karting track or enjoy a horseback ride through nature.',
        },
      },
      {
        id: 'sunday_family_relax',
        titles: {
          fr: 'Dimanche en famille : où emmener les proches ?',
          ar: 'وين تخرج العائلة نهار الأحد ؟',
          en: 'Family Sunday: Where to take your loved ones?',
        },
        bodies: {
          fr: "Parcs d'attractions, fermes pédagogiques et activités ludiques adaptées à tous les âges.",
          ar: 'منتزهات ألعاب، فضاءات ترفيهية ومطاعم فسيحة تعجب الصغار والكبار على ActivityTN.',
          en: 'Theme parks, open-air farm visits, and playful activities suitable for all ages.',
        },
      },
    ],
  },

  // =========================================================================
  // 5. MARDI FIN DE JOURNÉE (18h00) : Afterwork Chill, Gourmandise & Boardgames
  // =========================================================================
  {
    id: 'tuesday_afterwork',
    category: 'afterwork',
    channelId: 'reminders_weekend',
    triggerDayOfWeek: 3, // Mardi
    triggerHour: 18,
    triggerMinute: 0,
    variants: [
      {
        id: 'tuesday_sweet_treat',
        titles: {
          fr: "Envie d'une pause gourmande après le travail ?",
          ar: 'حاجة حلوة بعد نهار خدمة طويل ؟',
          en: 'Craving a sweet treat after work?',
        },
        bodies: {
          fr: 'Crêpes généreuses, gaufres croustillantes ou gelato artisanal pour égayer votre mardi.',
          ar: 'كريب غنية بالشوكولاتة، وافل مقرمش ولا مثلجات فاخرة باش تفرّح بيها قلبك.',
          en: 'Generous crêpes, crispy waffles, or artisan gelato to brighten your Tuesday.',
        },
      },
      {
        id: 'tuesday_boardgames_chill',
        titles: {
          fr: 'Soirée jeux de société ou café cosy ?',
          ar: 'طرح شكبة ولا ألعاب جماعية مع لصحاب ؟',
          en: 'Board game night or cozy café?',
        },
        bodies: {
          fr: 'Découvrez les boardgame cafés et adresses chaleureuses pour décompresser en semaine.',
          ar: 'اكتشف كافيهات الألعاب والأماكن الدافية باش تبدل الجو في وسط الجمعة.',
          en: 'Discover boardgame cafés and cozy spots to unwind with friends midweek.',
        },
      },
    ],
  },

  // =========================================================================
  // 6. MERCREDI MIDI (12h30) : Bons Plans, Réductions Flash & Partenaires Pro
  // =========================================================================
  {
    id: 'wednesday_promos',
    category: 'promos',
    channelId: 'promos_deals',
    triggerDayOfWeek: 4, // Mercredi
    triggerHour: 12,
    triggerMinute: 30,
    variants: [
      {
        id: 'wednesday_discounts_pro',
        titles: {
          fr: 'Bons plans de la semaine (-20% à -40%)',
          ar: 'بروموات الأسبوع تستنى فيك',
          en: 'Deals of the week (up to -40%)',
        },
        bodies: {
          fr: 'Nos partenaires Pro ont activé des réductions exclusives sur leurs menus et activités.',
          ar: 'شركاؤنا المميزون أطلقوا تخفيضات حصرية على أنشطتهم ومأكولاتهم هذا الأسبوع.',
          en: 'Our Pro partners launched exclusive discounts on their activities and dining.',
        },
      },
      {
        id: 'wednesday_lunch_deals',
        titles: {
          fr: 'Où déjeuner à prix réduit ce midi ?',
          ar: 'فطور نص نهار بأسعار خاصة وبروموات حصرية',
          en: 'Where to lunch for less today?',
        },
        bodies: {
          fr: 'Consultez les formules gourmandes et offres flash négociées pour la communauté ActivityTN.',
          ar: 'شوف العروض الحصرية والوجبات الشهية المتاحة حصرياً لمستخدمي التطبيق.',
          en: 'Check out tasty combos and flash offers negotiated for the ActivityTN community.',
        },
      },
      {
        id: 'wednesday_activity_pass',
        titles: {
          fr: 'Vente flash Loisirs : Réservez au meilleur prix',
          ar: 'تخفيضات فلاش على الأنشطة الترفيهية',
          en: 'Flash Leisure Sale: Book at the best price',
        },
        bodies: {
          fr: "Des sessions karting, bowling et escape game en promotion spéciale aujourd'hui.",
          ar: 'كارتينغ، بولينغ، وإسكيب جيم بتخفيضات خاصة متفوتهاش اليوم.',
          en: 'Special discounts on karting, bowling, and escape game sessions today.',
        },
      },
    ],
  },

  // =========================================================================
  // 7. JEUDI SOIR (19h00) : Concierge KharjaBot & Recommandations Sur-Mesure
  // =========================================================================
  {
    id: 'thursday_kharjabot',
    category: 'kharjabot',
    channelId: 'reminders_weekend',
    triggerDayOfWeek: 5, // Jeudi
    triggerHour: 19,
    triggerMinute: 0,
    variants: [
      {
        id: 'kharjabot_no_idea',
        titles: {
          fr: "Pas d'idée pour sortir ce soir ?",
          ar: 'حاير وين تمشي الليلة ؟',
          en: 'Wondering where to hang out tonight?',
        },
        bodies: {
          fr: 'Demandez conseil à KharjaBot sur ActivityTN pour une recommandation sur-mesure !',
          ar: 'اسأل خرجة بوت على التطبيق يلقالك اقتراح على مقاسك في ثواني !',
          en: 'Ask KharjaBot on ActivityTN for a tailored outing recommendation!',
        },
      },
      {
        id: 'kharjabot_budget_mood',
        titles: {
          fr: 'KharjaBot a sélectionné 3 sorties pour vous',
          ar: 'خرجة بوت عندو ليك 3 بلايص ممتازة',
          en: 'KharjaBot picked 3 outings just for you',
        },
        bodies: {
          fr: "Dites-lui votre humeur et votre budget, l'intelligence artificielle s'occupe de tout vous organiser.",
          ar: 'قلو قداش ميزانيتك وشنوة جوك، والذكاء الاصطناعي يختارلك الخرجة المثالية.',
          en: 'Tell it your mood and budget, our AI finds the perfect match in seconds.',
        },
      },
      {
        id: 'kharjabot_weekend_prep',
        titles: {
          fr: 'Préparez un week-end parfait en un clic',
          ar: 'برمج ويكاندك في دقيقة مع خرجة بوت',
          en: 'Plan your perfect weekend in 1 click',
        },
        bodies: {
          fr: 'Évitez les plans de dernière minute : laissez KharjaBot vous concocter un itinéraire inédit.',
          ar: 'ما تخليش اللحظة الأخيرة : خلي خرجة بوت يقترح عليك برنامج كامل يعجب صحابك.',
          en: 'Skip the last-minute stress: let KharjaBot craft a unique itinerary for you.',
        },
      },
    ],
  },
];

/**
 * Pioche une variante au hasard pour un créneau donné.
 */
export function getRandomVariant(slot: NotificationSlot): NotificationMessageVariant {
  const index = Math.floor(Math.random() * slot.variants.length);
  return slot.variants[index];
}

/**
 * Renvoie pour chaque créneau hebdomadaire une variante aléatoire
 * formatée dans la langue demandée.
 */
export function getRandomizedSchedule(language: string = 'fr'): Array<{
  id: string;
  channelId: string;
  triggerDayOfWeek: number;
  triggerHour: number;
  triggerMinute: number;
  title: string;
  body: string;
}> {
  const langKey = language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'fr';

  return NOTIFICATION_SLOTS.map((slot) => {
    const variant = getRandomVariant(slot);
    const title = variant.titles[langKey] || variant.titles.fr;
    const body = variant.bodies[langKey] || variant.bodies.fr;

    return {
      id: slot.id,
      channelId: slot.channelId,
      triggerDayOfWeek: slot.triggerDayOfWeek,
      triggerHour: slot.triggerHour,
      triggerMinute: slot.triggerMinute,
      title,
      body,
    };
  });
}
