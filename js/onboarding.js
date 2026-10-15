/* =====================================================================
   onboarding.js — Accueil multilingue et personnalisation locale
   Les informations du visiteur ne quittent jamais son navigateur.
   ===================================================================== */

(() => {
  "use strict";

  const STORAGE_KEY = "yahya_portfolio_profile_v1";
  const SUPPORTED_LANGUAGES = ["fr", "en", "ar"];

  const COPY = {
    fr: {
      page: {
        "nav.about": "À propos",
        "nav.experience": "Expérience",
        "nav.projects": "Projets",
        "nav.skills": "Compétences",
        "nav.education": "Formation",
        "nav.certifications": "Certifications",
        "nav.contact": "Contact",
        "hero.available": "Disponible pour des opportunités IA",
        "hero.role": "Ingénieur en Intelligence Artificielle & Big Data",
        "hero.sub": "Data Science · Machine Learning · LLMs · Applications web",
        "hero.projects": "Découvrir mes projets",
        "hero.contact": "Me contacter",
        "section.about": "À propos",
        "section.experience": "Expérience",
        "section.projects": "Projets",
        "section.projectsHint": "Sélectionnez un projet pour découvrir son histoire et sa démo.",
        "section.skills": "Compétences techniques",
        "section.skillsHint": "Le cœur de mon stack, du modèle à la mise en production.",
        "section.education": "Formation",
        "section.certifications": "Certifications",
        "section.languages": "Langues",
        "section.contact": "On se connecte ?",
        "section.contactText": "Un projet, une opportunité, ou simplement envie d’échanger sur l’IA ? Laissez-moi un message, je vous réponds rapidement.",
        "hero.cv": "Télécharger mon CV",
        "contact.cv": "CV (PDF)",
        "hero.metaLocation": "Rabat, Maroc",
        "hero.metaApplied": "IA appliquée",
        "hero.metaProd": "Produits en production",
        "contact.phone": "Téléphone",
        "contact.location": "Localisation",
        "contact.formTitle": "Envoyez-moi un message",
        "contact.name": "Nom",
        "contact.namePlaceholder": "Votre nom",
        "contact.email": "Email",
        "contact.subject": "Sujet",
        "contact.subjectPlaceholder": "Opportunité, projet, question…",
        "contact.message": "Message",
        "contact.messagePlaceholder": "Bonjour Yahya, …",
        "contact.send": "Envoyer le message",
        "footer.text": "Conçu avec précision, curiosité et une touche d’électricité."
      },
      onboarding: {
        eyebrow1: "Bienvenue dans mon univers",
        title1: "Bonjour, hello, مرحباً.",
        intro1: "Un portfolio interactif où se rencontrent intelligence artificielle, produits web et expériences de terrain.",
        languageLegend: "Choisissez votre langue",
        continue: "Continuer",
        profileEyebrow: "Faisons connaissance",
        profileTitle: "Et vous, qui êtes-vous ?",
        profileIntro: "Quelques mots suffisent pour rendre votre visite plus personnelle.",
        nameLabel: "Comment puis-je vous appeler ?",
        namePlaceholder: "Votre prénom",
        roleLegend: "Quel profil vous ressemble le plus ?",
        professionLabel: "Votre métier ou spécialité (facultatif)",
        professionPlaceholder: "Ex. Talent Acquisition, Data Engineer…",
        back: "Retour",
        meet: "Faire connaissance",
        welcomeEyebrow: "Ravi de vous rencontrer",
        welcomeTitle: "Bienvenue dans mon portfolio.",
        welcomeNamed: (name) => `Enchanté, ${name}.`,
        welcomeText: "Explorez mes projets, mon parcours et les produits IA que j’aime transformer en expériences concrètes.",
        enter: "Découvrir le portfolio",
        skip: "Explorer sans personnaliser",
        close: "Fermer l’accueil",
        localeLabel: "Changer la langue",
        visitorGreeting: (name) => `Bonjour ${name}, bienvenue dans mon univers.`,
        roles: {
          recruiter: "Recrutement",
          engineer: "Tech & IA",
          student: "Étudiant·e",
          business: "Entreprise",
          curious: "Curieux·se"
        }
      }
    },
    en: {
      page: {
        "nav.about": "About",
        "nav.experience": "Experience",
        "nav.projects": "Projects",
        "nav.skills": "Skills",
        "nav.education": "Education",
        "nav.certifications": "Certifications",
        "nav.contact": "Contact",
        "hero.available": "Open to AI opportunities",
        "hero.role": "Artificial Intelligence & Big Data Engineer",
        "hero.sub": "Data Science · Machine Learning · LLMs · Web applications",
        "hero.projects": "Explore my projects",
        "hero.contact": "Get in touch",
        "section.about": "About",
        "section.experience": "Experience",
        "section.projects": "Projects",
        "section.projectsHint": "Select a project to discover its story and interactive demo.",
        "section.skills": "Technical skills",
        "section.skillsHint": "My core stack, from model to production.",
        "section.education": "Education",
        "section.certifications": "Certifications",
        "section.languages": "Languages",
        "section.contact": "Let’s connect.",
        "section.contactText": "Have a project, an opportunity, or simply want to talk about AI? Leave me a message and I’ll get back to you quickly.",
        "hero.cv": "Download my resume",
        "contact.cv": "Resume (PDF)",
        "hero.metaLocation": "Rabat, Morocco",
        "hero.metaApplied": "Applied AI",
        "hero.metaProd": "Shipped to production",
        "contact.phone": "Phone",
        "contact.location": "Location",
        "contact.formTitle": "Send me a message",
        "contact.name": "Name",
        "contact.namePlaceholder": "Your name",
        "contact.email": "Email",
        "contact.subject": "Subject",
        "contact.subjectPlaceholder": "Opportunity, project, question…",
        "contact.message": "Message",
        "contact.messagePlaceholder": "Hi Yahya, …",
        "contact.send": "Send message",
        "footer.text": "Designed with precision, curiosity and a spark of electricity."
      },
      onboarding: {
        eyebrow1: "Welcome to my world",
        title1: "Hello, bonjour, مرحباً.",
        intro1: "An interactive portfolio where artificial intelligence, web products and real-world experience meet.",
        languageLegend: "Choose your language",
        continue: "Continue",
        profileEyebrow: "Let’s get acquainted",
        profileTitle: "And who are you?",
        profileIntro: "A few words are enough to make your visit feel more personal.",
        nameLabel: "What should I call you?",
        namePlaceholder: "Your first name",
        roleLegend: "Which profile best describes you?",
        professionLabel: "Your role or speciality (optional)",
        professionPlaceholder: "e.g. Talent Acquisition, Data Engineer…",
        back: "Back",
        meet: "Nice to meet you",
        welcomeEyebrow: "Great to meet you",
        welcomeTitle: "Welcome to my portfolio.",
        welcomeNamed: (name) => `Nice to meet you, ${name}.`,
        welcomeText: "Explore my projects, journey, and the AI products I enjoy turning into tangible experiences.",
        enter: "Explore the portfolio",
        skip: "Explore without personalising",
        close: "Close welcome",
        localeLabel: "Change language",
        visitorGreeting: (name) => `Hello ${name}, welcome to my world.`,
        roles: {
          recruiter: "Recruiting",
          engineer: "Tech & AI",
          student: "Student",
          business: "Business",
          curious: "Curious"
        }
      }
    },
    ar: {
      page: {
        "nav.about": "نبذة عني",
        "nav.experience": "الخبرات",
        "nav.projects": "المشاريع",
        "nav.skills": "المهارات",
        "nav.education": "التكوين",
        "nav.certifications": "الشهادات",
        "nav.contact": "تواصل معي",
        "hero.available": "متاح لفرص في مجال الذكاء الاصطناعي",
        "hero.role": "مهندس ذكاء اصطناعي وبيانات ضخمة",
        "hero.sub": "علم البيانات · تعلم الآلة · النماذج اللغوية · تطبيقات الويب",
        "hero.projects": "اكتشف مشاريعي",
        "hero.contact": "تواصل معي",
        "section.about": "نبذة عني",
        "section.experience": "الخبرات",
        "section.projects": "المشاريع",
        "section.projectsHint": "اختر مشروعاً لاكتشاف قصته وتجربته التفاعلية.",
        "section.skills": "المهارات التقنية",
        "section.skillsHint": "أدواتي الأساسية، من النموذج إلى بيئة الإنتاج.",
        "section.education": "التكوين",
        "section.certifications": "الشهادات",
        "section.languages": "اللغات",
        "section.contact": "لنتواصل.",
        "section.contactText": "لديك مشروع أو فرصة أو ترغب في الحديث عن الذكاء الاصطناعي؟ اترك لي رسالة وسأرد عليك بسرعة.",
        "hero.cv": "تحميل سيرتي الذاتية",
        "contact.cv": "السيرة الذاتية (PDF)",
        "hero.metaLocation": "الرباط، المغرب",
        "hero.metaApplied": "ذكاء اصطناعي تطبيقي",
        "hero.metaProd": "منتجات قيد الإنتاج",
        "contact.phone": "الهاتف",
        "contact.location": "الموقع",
        "contact.formTitle": "أرسل لي رسالة",
        "contact.name": "الاسم",
        "contact.namePlaceholder": "اسمك",
        "contact.email": "البريد الإلكتروني",
        "contact.subject": "الموضوع",
        "contact.subjectPlaceholder": "فرصة، مشروع، سؤال…",
        "contact.message": "الرسالة",
        "contact.messagePlaceholder": "مرحباً يحيى، …",
        "contact.send": "إرسال الرسالة",
        "footer.text": "صُمّم بدقة وفضول ولمسة من الكهرباء."
      },
      onboarding: {
        eyebrow1: "أهلاً بك في عالمي",
        title1: "مرحباً بكم في عالمي.",
        intro1: "ملف أعمال تفاعلي يجمع بين الذكاء الاصطناعي ومنتجات الويب والخبرة الميدانية.",
        languageLegend: "اختر لغتك",
        continue: "متابعة",
        profileEyebrow: "لنتعارف",
        profileTitle: "ومن أنت؟",
        profileIntro: "بضع كلمات تكفي لجعل زيارتك أكثر خصوصية.",
        nameLabel: "بأي اسم يمكنني مناداتك؟",
        namePlaceholder: "اسمك الأول",
        roleLegend: "أي وصف يناسبك أكثر؟",
        professionLabel: "مهنتك أو تخصصك (اختياري)",
        professionPlaceholder: "مثال: توظيف، مهندس بيانات…",
        back: "رجوع",
        meet: "سعيد بلقائك",
        welcomeEyebrow: "سعيد بالتعرف عليك",
        welcomeTitle: "أهلاً بك في ملف أعمالي.",
        welcomeNamed: (name) => `تشرفت بمعرفتك، ${name}.`,
        welcomeText: "اكتشف مشاريعي ومساري ومنتجات الذكاء الاصطناعي التي أحولها إلى تجارب ملموسة.",
        enter: "اكتشف ملف الأعمال",
        skip: "التصفح دون تخصيص",
        close: "إغلاق الترحيب",
        localeLabel: "تغيير اللغة",
        visitorGreeting: (name) => `مرحباً ${name}، أهلاً بك في عالمي.`,
        roles: {
          recruiter: "التوظيف",
          engineer: "التقنية والذكاء الاصطناعي",
          student: "طالب/ة",
          business: "شركة",
          curious: "فضولي/ة"
        }
      }
    }
  };

  const elements = {
    root: document.getElementById("onboarding"),
    shell: document.querySelector(".onboarding__shell"),
    close: document.getElementById("onboardingClose"),
    skip: document.getElementById("onboardingSkip"),
    localeToggle: document.getElementById("localeToggle"),
    localeCode: document.getElementById("localeCode"),
    localeMenu: document.getElementById("localeMenu"),
    languageContinue: document.getElementById("languageContinue"),
    profileBack: document.getElementById("profileBack"),
    form: document.getElementById("visitorForm"),
    name: document.getElementById("visitorName"),
    profession: document.getElementById("visitorProfession"),
    enter: document.getElementById("enterPortfolio"),
    summary: document.getElementById("visitorSummary"),
    greeting: document.getElementById("visitorGreeting")
  };

  if (!elements.root || !elements.shell) return;
  elements.root.setAttribute("inert", "");

  let profile = readProfile();
  let selectedLanguage = normaliseLanguage(profile?.language || navigator.language);
  let selectedRole = profile?.role || "";
  let currentStep = 1;
  let previousFocus = null;
  let firstRun = !profile;

  function normaliseLanguage(language) {
    const short = String(language || "fr").slice(0, 2).toLowerCase();
    return SUPPORTED_LANGUAGES.includes(short) ? short : "fr";
  }

  function readProfile() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return value && typeof value === "object" ? value : null;
    } catch (_) {
      return null;
    }
  }

  function saveProfile(value) {
    profile = { version: 1, ...value };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch (_) {}
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element && typeof value === "string") element.textContent = value;
  }

  function applyLocale(language) {
    selectedLanguage = normaliseLanguage(language);
    const locale = COPY[selectedLanguage];
    document.documentElement.lang = selectedLanguage;
    document.documentElement.dir = selectedLanguage === "ar" ? "rtl" : "ltr";
    elements.localeCode.textContent = selectedLanguage.toUpperCase();
    elements.localeToggle.setAttribute("aria-label", locale.onboarding.localeLabel);
    elements.localeToggle.title = locale.onboarding.localeLabel;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      const value = locale.page[element.dataset.i18n];
      if (typeof value === "string") element.textContent = value;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      const value = locale.page[element.dataset.i18nPlaceholder];
      if (typeof value === "string") element.placeholder = value;
    });

    updateOnboardingCopy();
    updateGreeting();
    document.dispatchEvent(new CustomEvent("portfolio:locale-changed", {
      detail: { language: selectedLanguage }
    }));
  }

  function updateOnboardingCopy() {
    const copy = COPY[selectedLanguage].onboarding;
    setText("onboardingEyebrow", copy.eyebrow1);
    setText("onboardingTitle", copy.title1);
    setText("onboardingIntro", copy.intro1);
    setText("languageLegend", copy.languageLegend);
    elements.languageContinue.innerHTML = `${copy.continue} <span aria-hidden="true">→</span>`;
    setText("profileEyebrow", copy.profileEyebrow);
    setText("profileTitle", copy.profileTitle);
    setText("profileIntro", copy.profileIntro);
    setText("nameLabel", copy.nameLabel);
    elements.name.placeholder = copy.namePlaceholder;
    setText("roleLegend", copy.roleLegend);
    setText("professionLabel", copy.professionLabel);
    elements.profession.placeholder = copy.professionPlaceholder;
    elements.profileBack.innerHTML = `<span aria-hidden="true">←</span> ${copy.back}`;
    document.getElementById("profileContinue").innerHTML = `${copy.meet} <span aria-hidden="true">→</span>`;
    setText("welcomeEyebrow", copy.welcomeEyebrow);
    setText("welcomeTitle", profile?.name ? copy.welcomeNamed(profile.name) : copy.welcomeTitle);
    setText("welcomeText", copy.welcomeText);
    elements.enter.innerHTML = `${copy.enter} <span aria-hidden="true">↗</span>`;
    elements.skip.textContent = copy.skip;
    elements.close.setAttribute("aria-label", copy.close);

    document.querySelectorAll("[data-role-label]").forEach((element) => {
      element.textContent = copy.roles[element.dataset.roleLabel] || element.textContent;
    });
    updateSummary();
  }

  function updateLanguageSelection() {
    document.querySelectorAll("[data-language]").forEach((button) => {
      const selected = button.dataset.language === selectedLanguage;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    document.querySelectorAll("[data-locale-option]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.localeOption === selectedLanguage));
    });
  }

  function toggleLocaleMenu(open) {
    if (!elements.localeMenu) return;
    const isOpen = open ?? elements.localeMenu.hidden;
    elements.localeMenu.hidden = !isOpen;
    elements.localeToggle.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) elements.localeMenu.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
  }

  // Change la langue depuis la barre de navigation, sans rouvrir l'accueil
  function switchLanguage(language) {
    applyLocale(language);
    updateLanguageSelection();
    saveProfile(profile
      ? { ...profile, language: selectedLanguage }
      : { language: selectedLanguage, dismissed: true, name: "", role: "", profession: "" });
  }

  function selectRole(role) {
    selectedRole = role;
    document.querySelectorAll("[data-role]").forEach((button) => {
      const selected = button.dataset.role === role;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function showStep(step) {
    currentStep = Math.min(3, Math.max(1, Number(step) || 1));
    document.querySelectorAll("[data-step]").forEach((panel) => {
      const active = Number(panel.dataset.step) === currentStep;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    document.querySelectorAll("[data-progress]").forEach((dot) => {
      const position = Number(dot.dataset.progress);
      dot.classList.toggle("is-active", position === currentStep);
      dot.classList.toggle("is-complete", position < currentStep);
    });
    elements.shell.setAttribute(
      "aria-labelledby",
      currentStep === 1 ? "onboardingTitle" : currentStep === 2 ? "profileTitle" : "welcomeTitle"
    );
    elements.skip.hidden = currentStep === 3;

    requestAnimationFrame(() => {
      const target = currentStep === 1
        ? document.querySelector(`[data-language="${selectedLanguage}"]`)
        : currentStep === 2 ? elements.name : elements.enter;
      target?.focus({ preventScroll: true });
    });
  }

  function setBackgroundInert(inert) {
    [document.getElementById("nav"), document.getElementById("mainContent"), document.getElementById("toTop")]
      .filter(Boolean)
      .forEach((element) => {
        if (inert) element.setAttribute("inert", "");
        else element.removeAttribute("inert");
      });
  }

  function openOnboarding(options = {}) {
    previousFocus = document.activeElement;
    firstRun = options.firstRun ?? false;
    elements.root.dataset.firstRun = String(firstRun);
    elements.root.removeAttribute("inert");
    elements.root.classList.add("is-open");
    elements.root.setAttribute("aria-hidden", "false");
    document.documentElement.classList.remove("onboarding-pending");
    document.body.classList.add("has-overlay");
    setBackgroundInert(true);
    elements.name.value = profile?.name || "";
    elements.profession.value = profile?.profession || "";
    selectRole(profile?.role || selectedRole);
    showStep(options.step || 1);
  }

  function closeOnboarding({ remember = true } = {}) {
    if (remember && !profile) {
      saveProfile({ language: selectedLanguage, dismissed: true, name: "", role: "", profession: "" });
    } else if (remember && profile && profile.language !== selectedLanguage) {
      saveProfile({ ...profile, language: selectedLanguage });
    }
    elements.root.classList.remove("is-open");
    elements.root.setAttribute("aria-hidden", "true");
    elements.root.setAttribute("inert", "");
    document.body.classList.remove("has-overlay");
    setBackgroundInert(false);
    updateGreeting();
    const returnTarget = previousFocus && document.contains(previousFocus) ? previousFocus : elements.localeToggle;
    returnTarget?.focus({ preventScroll: true });
  }

  function updateSummary() {
    if (!elements.summary) return;
    const copy = COPY[selectedLanguage].onboarding;
    const parts = [];
    if (profile?.role && copy.roles[profile.role]) parts.push(copy.roles[profile.role]);
    if (profile?.profession) parts.push(profile.profession);
    elements.summary.textContent = parts.join(" · ");
    elements.summary.hidden = parts.length === 0;
  }

  function updateGreeting() {
    if (!elements.greeting) return;
    const name = String(profile?.name || "").trim();
    elements.greeting.hidden = !name;
    if (name) elements.greeting.textContent = COPY[selectedLanguage].onboarding.visitorGreeting(name);
  }

  function completeProfile() {
    const name = elements.name.value.trim();
    const profession = elements.profession.value.trim();
    saveProfile({
      language: selectedLanguage,
      name,
      role: selectedRole,
      profession,
      dismissed: false,
      completedAt: new Date().toISOString()
    });
    updateOnboardingCopy();
    updateGreeting();
    showStep(3);
    document.dispatchEvent(new CustomEvent("portfolio:profile-updated", { detail: { ...profile } }));
  }

  function getFocusableElements() {
    return [...elements.shell.querySelectorAll(
      'a[href], button:not([disabled]):not([hidden]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.closest("[hidden]") && element.offsetParent !== null);
  }

  document.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      applyLocale(button.dataset.language);
      updateLanguageSelection();
    });
  });

  document.querySelectorAll("[data-role]").forEach((button) => {
    button.addEventListener("click", () => selectRole(button.dataset.role));
  });

  elements.languageContinue.addEventListener("click", () => showStep(2));
  elements.profileBack.addEventListener("click", () => showStep(1));
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    completeProfile();
  });
  elements.enter.addEventListener("click", () => closeOnboarding());
  elements.skip.addEventListener("click", () => closeOnboarding());
  elements.close.addEventListener("click", () => closeOnboarding());
  elements.localeToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleLocaleMenu();
  });
  document.querySelectorAll("[data-locale-option]").forEach((button) => {
    button.addEventListener("click", () => {
      switchLanguage(button.dataset.localeOption);
      toggleLocaleMenu(false);
      elements.localeToggle.focus({ preventScroll: true });
    });
  });
  document.addEventListener("click", (event) => {
    if (elements.localeMenu && !elements.localeMenu.hidden && !event.target.closest(".locale")) toggleLocaleMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && elements.localeMenu && !elements.localeMenu.hidden) {
      toggleLocaleMenu(false);
      elements.localeToggle.focus({ preventScroll: true });
      return;
    }
    if (!elements.root.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeOnboarding();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = getFocusableElements();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  applyLocale(selectedLanguage);
  updateLanguageSelection();
  selectRole(selectedRole);

  if (firstRun) {
    openOnboarding({ step: 1, firstRun: true });
  } else {
    document.documentElement.classList.remove("onboarding-pending");
    elements.root.setAttribute("aria-hidden", "true");
    updateGreeting();
  }

  window.PortfolioProfile = {
    open: (step = 1) => openOnboarding({ step, firstRun: false }),
    get: () => profile ? { ...profile } : null,
    language: () => selectedLanguage
  };
})();
