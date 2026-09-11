/**
 * Latinske sentencije prikazane na /latinski.
 *
 * Izdvojeno iz stranice u modul kako bi isti podaci bili dostupni i
 * pretraživanju u /search.json.ts.
 */

export interface Sententia {
  /** Latinska sentencija */
  latin: string;
  /** Prijevod na hrvatski */
  translation: string;
  /** Autor ili izvor, gdje je pouzdano pripisiv */
  source: string;
}

export const sententiae: Sententia[] = [
  {
    latin: 'Carpe diem.',
    translation: 'Iskoristi dan.',
    source: 'Horacije, Ode 1.11',
  },
  {
    latin: 'Cogito, ergo sum.',
    translation: 'Mislim, dakle jesam.',
    source: 'René Descartes',
  },
  {
    latin: 'Veni, vidi, vici.',
    translation: 'Dođoh, vidjeh, pobijedih.',
    source: 'Julije Cezar',
  },
  {
    latin: 'Alea iacta est.',
    translation: 'Kocka je bačena.',
    source: 'Cezaru pripisuje Svetonije',
  },
  {
    latin: 'Errare humanum est.',
    translation: 'Ljudski je griješiti.',
    source: 'Poslovično, po Seneki',
  },
  {
    latin: 'Festina lente.',
    translation: 'Hiti polako.',
    source: 'Augustova deviza, preko Svetonija',
  },
  {
    latin: 'Memento mori.',
    translation: 'Sjeti se da ćeš umrijeti.',
    source: 'Klasična izreka',
  },
  {
    latin: 'Dum spiro, spero.',
    translation: 'Dok dišem, nadam se.',
    source: 'Klasična izreka',
  },
  {
    latin: 'Scientia potentia est.',
    translation: 'Znanje je moć.',
    source: 'Povezuje se s Francisom Baconom',
  },
  {
    latin: 'Audentes fortuna iuvat.',
    translation: 'Odvažnima sreća pomaže.',
    source: 'Vergilije, Eneida 10',
  },
  {
    latin: 'Per aspera ad astra.',
    translation: 'Preko trnja do zvijezda.',
    source: 'Poslovično',
  },
  {
    latin: 'Vox populi, vox Dei.',
    translation: 'Glas naroda, glas Božji.',
    source: 'Srednjovjekovna poslovica',
  },
  {
    latin: 'Tempus fugit.',
    translation: 'Vrijeme bježi.',
    source: 'Vergilije, Georgike 3',
  },
  {
    latin: 'In vino veritas.',
    translation: 'U vinu je istina.',
    source: 'Poslovično',
  },
  {
    latin: 'Ars longa, vita brevis.',
    translation: 'Umjetnost je dugotrajna, život kratak.',
    source: 'Hipokrat, preko Seneke',
  },
  {
    latin: 'Divide et impera.',
    translation: 'Podijeli pa vladaj.',
    source: 'Politička izreka',
  },
  {
    latin: 'Homo homini lupus.',
    translation: 'Čovjek je čovjeku vuk.',
    source: 'Po Plautu, Asinaria',
  },
  {
    latin: 'Nosce te ipsum.',
    translation: 'Spoznaj samoga sebe.',
    source: 'Latinski prijevod delfske izreke',
  },
  {
    latin: 'Sapere aude.',
    translation: 'Odvaži se biti mudar.',
    source: 'Horacije, Pisma 1.2',
  },
  {
    latin: 'Amor vincit omnia.',
    translation: 'Ljubav sve pobjeđuje.',
    source: 'Vergilije, Ekloge 10',
  },
  {
    latin: 'Si vis pacem, para bellum.',
    translation: 'Želiš li mir, pripremaj se za rat.',
    source: 'Po Vegeciju',
  },
  {
    latin: 'Acta non verba.',
    translation: 'Djela, ne riječi.',
    source: 'Poslovično',
  },
  {
    latin: 'Verba volant, scripta manent.',
    translation: 'Izgovorene riječi lete, zapisane ostaju.',
    source: 'Poslovično',
  },
  {
    latin: 'Nemo iudex in causa sua.',
    translation: 'Nitko ne može biti sudac u svojoj stvari.',
    source: 'Pravna izreka',
  },
  {
    latin: 'Dura lex, sed lex.',
    translation: 'Zakon je strog, ali je zakon.',
    source: 'Pravna izreka',
  },
  {
    latin: 'Mens sana in corpore sano.',
    translation: 'Zdrav duh u zdravu tijelu.',
    source: 'Juvenal, Satire 10',
  },
  {
    latin: 'Non scholae sed vitae discimus.',
    translation: 'Ne učimo za školu, nego za život.',
    source: 'Po Seneki, Pisma 106',
  },
  {
    latin: 'Fiat lux.',
    translation: 'Neka bude svjetlost.',
    source: 'Vulgata, Knjiga Postanka 1,3',
  },
];
