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
    title: 'Smrt i ja',
    poet: 'Antun Branko Šimić',
    life: '1898 — 1925',
    year: '1913. – 1924.',
    text: `Smrt nije izvan mene. Ona je u meni
od najprvog početka: sa mnom raste
u svakom času
Jednog dana
ja zastanem
a ona raste dalje
u meni dok me cijelog ne proraste
i stigne na rub mene. Moj svršetak
njen pravi je početak:
kad kraljuje dalje sama`,
  },
  {
    title: 'Utjeha očiju',
    poet: 'Antun Branko Šimić',
    life: '1898 — 1925',
    year: '1913. – 1924.',
    text: `Draga, ovaj grad, što žut i sivkast tutnji,
Pije svakog dana krv iz moga tijela
I ja sahnem, sahnem, u zloj nekoj slutnji,
Da se bliži starost krezuba i bijela.

Draga, ovdje mene često žudnja svlada
Za veselim mirom livada i voda,
Za šumama punim sjenaka i hlada
I za tromim lêtom oblaka i roda.

Onda tražim tvojih očiju dubljine,
Što ko plav i zelen bezdan mirno sjaju:
U njima su nebo, rijeke i nizine,
Vrtovi i kuće, ko u junskom kraju.

U njima je hlad i svježina vrbika;
Pod granama sjenke počivaju, duge;
Kroz granje se vere satir, moga lika,
Malko sulud i pun zagonetne tuge.

Povrh žitâ, što se suncem zapaljena
Žute i crljene, lete ptice neke;
Lete, ko odrazi drugog svijeta snena,
Na oblake neke svijetle i daleke.

Draga, sve to jedna vizija mi biva,
Iz očiju svet i čudan predjel sijeva.
Onda tonu stvari, jedan svijet se skriva.
Mirno u dnu junsko veče dogorijeva.`,
  },
  {
    title: 'Vagonaši',
    poet: 'Dobriša Cesarić',
    life: '1902 — 1980',
    year: '1930',
    text: `Mi stanujemo u vagonu
Što nije nikada na putu,
U jednom kutu nam je krevet,
A kuhinja u drugom kutu.

Tu svaki vagon dimnjak ima,
Željezni, nahereni, tužni.
U ovom kraju stareži i dima
Najljepši dan poružni.

A naša ulica je duga,
Duga,
I čudno ima ime:
Napuštena pruga.

Sve kuće brojeve imadu,
Pa ima ga i naša, bože moj.
Al nema tako velikog u gradu
Ko naš bijeli željeznički broj.

I vrt imade naša kuća:
Ukraj pruge drač,
Da igrajuć se u njem djeca
Zaborave na glad i plač.

U nedjelju kad stane rad,
Eh, onda bijeda pije, pije;
Zapjeva neko hrapavim glasom,
A neko ženu bije.

Alkohol ubija... znamo, o znamo,
Znamo da alkohol škodi,
No rakije, rakije, rakije amo,
Jer utjehe nema u vodi.

Sada je ljeto... veliko, zlatno.
Odoše bogataši iz grada
Da traže odmora po svijetu,
Al mi smo tu, mi roblje rada.

I naše oči dalje gasnu,
I znoje se u radu dlanovi;
Umjesto nas putovahu svijetom
Naši stanovi.

Nedjelja. Tužno. Znamo, o znamo,
Znamo da alkohol škodi,
No rakije, rakije, rakije amo,
Jer utjehe nema u vodi.`,
  },
  {
    title: 'Voćka poslije kiše',
    poet: 'Dobriša Cesarić',
    life: '1902 — 1980',
    year: '1930',
    text: `Gle malu voćku poslije kiše:
Puna je kapi pa ih njiše.
I bliješti suncem obasjana,
Čudesna raskoš njenih grana.

Al nek se sunce malko skrije,
Nestane sve te čarolije.
Ona je opet kao prvo,
Obično, jadno, malo drvo.`,
  },
  {
    title: 'Himna slobodi',
    poet: 'Ivan Gundulić',
    life: '1589 — 1638',
    year: '1628',
    collection: 'Dubravka',
    text: `O lijepa, o draga, o slatka slobodo,
dar u kom sva blaga višnji nam bog je dô,
uzroče istini od naše sve slave,
uresu jedini od ove Dubrave,
sva srebra, sva zlata, svi ljudcki životi
ne mogu bit plata tvôj čistoj ljepoti!`,
  },
  {
    title: 'Dvoje',
    poet: 'Dobriša Cesarić',
    life: '1902 — 1980',
    year: '1930',
    text: `Ljubeći se od postanja
Kroz maglu svijeta dvoje bludi,
Sa čudnom čežnjom, da se nađu
U metežu stranih ljudi.

Razmišljaju o sebi često
I prevarit će se kadikad,
Da su jedno drugo našli,
A neće se naći nikad.

Pa ipak, on će jednom doć
U sobu onoga hotela,
U kom je ona cijelu noć
Uz uzdisaje mora bdjela.

Pred zoru, kad u krevet legne,
Na onu misleć koju traži,
Ni slutit neće, da mu jorgan
Pokrivaše već njene draži.

I možda će u restoranu
Iz one čaše on da pije,
Na kojoj bjehu njena usta
Nekoliko dana prije.`,
  },
  {
    title: 'Pjesma mrtvog pjesnika',
    poet: 'Dobriša Cesarić',
    life: '1902 — 1980',
    year: '1930',
    text: `Moj prijatelju, mene više nema,
Al nisam samo zemlja, samo trava,
Jer knjiga ta, što držiš je u ruci,
Samo je dio mene koji spava.
I ko je čita - u život me budi.
Probudi me, i bit ću tvoja java.

Ja nemam više proljeća i ljeta,
Jeseni nemam, niti zima.
Siroti mrtvac ja sam, koji u se
Ništa od svijeta ne može da prima.
I što od svijetlog osta mi života,
U zagrljaju ostalo je rima.

Pred smrću ja se skrih (koliko mogoh)
U stihove. U žaru sam ih kovo,
Al zatvoriš li za njih svoje srce,
Oni su samo sjen i mrtvo slovo.
Otvori ga, i ja ću u te prijeći
Ko bujna rijeka u korito novo.

Još koji časak htio bih da živim
U grudima ti. Sve svoje ljepote
Ja ću ti dati. Sve misli, sve snove,
Sve što mi vrijeme nemilosno ote,
Sve zanose, sve ljubavi, sve nade,
Sve uspomene -- o mrtvi živote!

Povrati me u moje stare dane!
Ja hoću svjetla! Sunca, koje zlati
Sve čeg se takne. Ja topline hoću
I obzorja, moj druže nepoznati.
I zanosa! i zvijezda, kojih nema
U mojoj noći. Njih mi, dragi, vrati.

Ko oko svjetla leptirice noćne
Oko života tužaljke mi kruže.
Pomozi mi da dignem svoje vjeđe,
Da ruke mi se u čeznuću pruže.
Ja hoću biti mlad, ja hoću ljubit,
I biti ljubljen, moj neznani druže!

Sav život moj u tvojoj sad je ruci.
Probudi me! Proživjet ćemo oba
Sve moje stihom zadržane sate,
Sve sačuvane sne iz davnog doba.
Pred vratima života ja sam prosjak.
Čuj moje kucanje! Moj glas iz groba!`,
  },
  {
    title: 'Moja preobraženja',
    poet: 'Antun Branko Šimić',
    life: '1898 — 1925',
    year: '1920',
    collection: 'Preobraženja',
    text: `Ja pjevam sebe kad iz crne bezdane i mučne noći
iznesem blijedo meko lice u kristalno jutro
i s pogledima plivam preko polja livada i voda

Ja pjevam sebe koji umrem na dan bezbroj puta
i bezbroj puta uskrsnem

O Bože daj me umorna od mijena
preobrazi u tvoju svijetlu nepromjenjivu i vječnu zvijezdu
što s dalekog će neba noću sjati
u crne muke noćnih očajnika`,
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
