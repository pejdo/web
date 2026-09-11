/**
 * Pjesme prikazane na /pjesme.
 *
 * Izdvojeno iz stranice u modul kako bi isti podaci bili dostupni i
 * pretraživanju u /search.json.ts.
 */

export interface Pjesma {
  /** Naslov pjesme */
  title: string;
  /** Pjesnik */
  poet: string;
  /** Godine rođenja i smrti pjesnika */
  life: string;
  /** Godina objave pjesme */
  year: string;
  /**
   * Cjeloviti tekst pjesme, stih po stih. Prazan red razdvaja kitice.
   * Renderira se kroz whitespace-pre-wrap, pa se čuvaju i prijelomi
   * stihova i uvlake na početku stiha (npr. u Preradovićevu „Putniku”).
   */
  text?: string;
  /** Zbirka u kojoj je pjesma prvi put objavljena */
  collection?: string;
  /** Vanjski izvor cjelovitog teksta (poezija.hr) */
  sourceUrl?: string;
}

// Tekstovi se upisuju u polje `text` i preuzimaju iz tiskanog ili
// provjerenog izvora. Dok tekst nije upisan, kartica vodi na poezija.hr.
export const pjesme: Pjesma[] = [
  {
    title: 'Notturno',
    poet: 'Antun Gustav Matoš',
    life: '1873 — 1914',
    year: '1912',
    text: `Mlačna noć; u selu lavež; kasan
Ćuk il netopir;
Ljubav cvijeća – miris jak i strasan
Slavi tajni pir.

Sitni cvrčak sjetno cvrči, jasan
Kao srebren vir;
Teške oči sklapaju se na san,
S neba rosi mir.

S mrkog tornja bat
Broji pospan sat,
Blaga svjetlost sipi sa visinâ;

Kroz samoću, muk,
Sve je tiši huk:
Željeznicu guta već daljina.`,
  },
  {
    title: 'Jesenje veče',
    poet: 'Antun Gustav Matoš',
    life: '1873 — 1914',
    year: '1909',
    sourceUrl: 'https://www.poezija.hr/jesenje-vece-antun-gustav-matos/',
  },
  {
    title: '1909',
    poet: 'Antun Gustav Matoš',
    life: '1873 — 1914',
    year: '1909',
    sourceUrl: 'https://www.poezija.hr/1909-antun-gustav-matos/',
  },
  {
    title: 'Svakidašnja jadikovka',
    poet: 'Tin Ujević',
    life: '1891 — 1955',
    year: '1920',
    sourceUrl: 'https://www.poezija.hr/',
  },
  {
    title: 'Kolajna',
    poet: 'Tin Ujević',
    life: '1891 — 1955',
    year: '1926',
    sourceUrl: 'https://www.poezija.hr/',
  },
  {
    title: 'Moj dom',
    poet: 'Silvije Strahimir Kranjčević',
    life: '1865 — 1908',
    year: '1898',
    sourceUrl: 'https://www.poezija.hr/moj-dom-silvije-strahimir-kranjcevic/',
  },
  {
    title: 'Gospodskom Kastoru',
    poet: 'Silvije Strahimir Kranjčević',
    life: '1865 — 1908',
    year: '1902',
    sourceUrl: 'https://www.poezija.hr/gospodskomu-kastoru-silvije-strahimir-kranjcevic/',
  },
  {
    title: 'Rodu o jeziku',
    poet: 'Petar Preradović',
    life: '1818 — 1872',
    year: '1860',
    sourceUrl: 'https://www.poezija.hr/',
  },
  {
    title: 'Smrt Smail-age Čengića',
    poet: 'Ivan Mažuranić',
    life: '1814 — 1890',
    year: '1846',
    sourceUrl: 'https://www.poezija.hr/',
  },
  {
    title: 'Putnik',
    poet: 'Petar Preradović',
    life: '1818 — 1872',
    year: '1846',
    text: `Bože mili, kud sam zašo!
   Noć me stigla u tuđini,
   Ne znam puta, ne znam staze,
   Svuda goli kamen gaze,
   Trudne noge po pustinji!

Još konaka nijesam našo!
   Sjever brije s snježnog brda,
   A tuđincu, siromaku
   Još je veći mrak u mraku,
   Još je tvrđa zemlja tvrda!

Naokolo magla pada,
   Zastrta je mjesečina,
   Ne vidi se zvijezdam traga;
   Majko mila, majko draga,
   Da ti vidiš svoga sina!

Da ti vidiš njega sada
   Okružena bijedom svega,
   Ti bi gorko zaplakala,
   Ruka bi ti zadrhtala
   Od žalosti - grleć njega!

Zašto tebe nijesam slušo,
   Kad si meni govorila:
   "Ne idi sinko od matere,
   Koja mekan krevet stere
   Tebi usrjed svoga krila!

Ne idi, sinko, draga dušo,
   Ne idi od krova očinoga,
   Tuđa zemlja ima svoje,
   Ne spoznaje jade tvoje,
   Tuđa ljubav ljubi svoga!" -

Govoreći sobom tako,
   K kolibici jednoj klima,
   Koju spazi iznenada,
   Umoreni putnik sada,
   I zakuca na vratima.

Otvarajuć sve polako,
   Zamišljena: tko će biti?
   Glavu pruži jedna stara.
   „Daj u ime Božjeg dara,
   Bako, meni prenoćiti!

Ne znam gdje sam - kud sam zašo,
   Noć me 'e stigla u tuđini,
   Ne znam puta, ne znam staze,
   Svuda goli kamen gaze,
   Trudne noge po pustinji!

Drugi konak gdje bih našo!
   Sjever brije s snježnog brda,
   A tuđincu, siromaku
   Još je veći mrak u mraku,
   Još je tvrđa zemlja tvrda.

Naokolo magla pada
   Zastrta je mjesečina,
   Ne vidi se zvijezdam traga,
   Majko mila, majko draga,
   Primi pod krov tuđeg sina!"

„Primila bih tebe rada;
   Ali vidiš da spavaju
   Ovdje sinka tri i ćerce,
   Koji cijelo majke srce
   I svu kuću ispunjaju!"

„Nij' daleko već do dana,
   Već pozdravlja pijevac vile,
   Dok zagrije danak Boži,
   Malo vatre bar naloži,
   Da otopim smrzle žile!"

„Vatra mi je zapretana,
   Drvah ne imam skoro ništa,
   Ovo malo, što 'e unutra,
   Trijeba mojoj djeci sjutra
   Kad se skupe kod ognjišta!"

„Za tuđinca ništa ne imaš,
   Tuđa majko, kad te moli,
   Tuđe dijete tvoje nije!" -
   S tim mu grozne suze dvije
   Niza lice kapnu doli.

„Gdje su ruke tvoje majke
   Sad da skupe suze sina?
   Gdje koljeno, da počine,
   Da si teško breme skine?
   Gdje je tvoja domovina?!"

Ko da su mu zmije ljute
   S ovim riječ'ma srce stisle,
   Ukočeni putnik stoji,
   Leden znoj mu čelo znoji
   I otimlje mozgu misle.

Ali oči uzdignute
   K strani glede - ah onamo!
   Gdje od drage domovine
   Svako jutro sunce sine,
   Tam' ga želja nosi - tamo!

„Tebi opet duša diše,
   Tebi srce opet bije;
   Domovino, majko srjeće!
   K tebi opet sin se kreće,
   Od radosti suze lije!

Primi opet svoje dijete,
   Primi vijek će tvoje biti,
   Ljubit tebe svako doba,
   U tvom polju daj mu groba,
   S tvojim cvijećem grom mu kiti!"`,
    collection: 'Prvenci',
  },
  {
    title: 'Opomena',
    poet: 'Antun Branko Šimić',
    life: '1898 — 1925',
    year: '1920',
    text: `Čovječe pazi
da ne ideš malen
ispod zvijezda!

Pusti
da cijelog tebe prođe
blaga svjetlost zvijezda!

Da ni za čim ne žališ
kad se budeš zadnjim pogledima
rastajo od zvijezda!

Na svom koncu
mjesto u prah
prijeđi sav u zvijezde!`,
  },
  {
    title: 'Balada iz predgrađa',
    poet: 'Dobriša Cesarić',
    life: '1902 — 1980',
    year: '1930',
    text: `I lije na uglu petrolejska lampa
svijetlost crvenkastožutu
na debelo blato kraj staroga plota
i dvije, tri cigle na putu.

I uvijek ista sirotinja uđje
u njezinu svjetlost iz mraka,
i s licem na kojem su obično brige
pređe je u par koraka.

A jedne večeri nekoga nema,
a morao bi proć;
I lampa gori,
i gori u magli,
i već je noć.

I nema ga sutra, ni prekosutra ne,
i vele da bolestan leži,
i nema ga mjesec, i nema ga dva,
i zima je već,
i sniježi.

A prolaze kao i dosad ljudi,
i maj već mirise -
a njega nema, i nema, i nema,
i nema ga više.

I lije na uglu petrolejska lampa
svijetlost crvenkastožutu
na debelo blato kraj staroga plota
i dvije, tri cigle na putu.`,
  },
];
