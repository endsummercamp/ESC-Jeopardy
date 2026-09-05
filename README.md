# ESC Jeopardy

Supercazzola. What is Antani?

Gioco Jeopardy in Vue 3, TypeScript e Vite. Sei giocatori, domande multimediali,
Daily Double e sigla a 8 bit, con la grafica pixel originale.

## Avvio

Serve Node.js 24.12 o successivo.

```sh
npm ci
npm run dev
```

Apri http://127.0.0.1:8000. La porta è fissa: se è occupata, ferma il vecchio
server prima di avviare Vite. Mantenere lo stesso indirizzo (host e porta)
permette di recuperare i salvataggi già presenti nel browser.

## Comandi

| Tasti | Azione |
| --- | --- |
| `1`–`6` | Seleziona il giocatore |
| `7` | Seleziona “nessuno ha indovinato” |
| `Alt + Y` | Assegna i punti e chiude la casella; con `7`, chiude senza vincitore |
| `Alt + N` | Sottrae i punti al giocatore |
| `Shift + Q` | Mostra la soluzione |
| `Shift + B` | Torna al tabellone |
| `Alt + Z` | Annulla l’ultima modifica alla partita |
| `?` | Apre o chiude il menu con comandi e gestione partita |

Clicca un nome per modificarlo, oppure un punteggio per selezionare il giocatore.
I comandi di punteggio funzionano sulla domanda aperta. Le caselle completate
si possono rivedere, ma non assegnano punti una seconda volta. Per correggere
un’assegnazione usa “Annulla azione”. Daily Double raddoppia il valore, come
nella versione originale. La sigla parte dal pulsante play nel footer.

## Domande e salvataggi

Il menu `?` permette di importare/esportare un set di domande, caricare la demo,
azzerare la partita o annullare un’azione. Il caricamento di un nuovo set chiede
conferma prima di azzerare punteggi e caselle. I nomi dei giocatori restano.

Il formato JSON originale è mantenuto. Esempio minimo:

```json
{
  "category1": [
    "Categoria",
    {
      "order": "1",
      "points": "100",
      "dailydouble": "no",
      "answer": "AAPL",
      "answer_type": "text",
      "question": "Qual è il ticker di Apple?",
      "question_type": "text"
    }
  ]
}
```

Come nel Jeopardy originale, la casella mostra prima `answer` (l’indizio),
poi `question` (la soluzione). Sono accettati da 1 a 12 categorie consecutive
(`category1`, `category2`, …), con lo stesso numero di domande, da 1 a 10,
per categoria. I tipi supportati sono `text`, `image`, `audio` e `video`.
I punteggi devono essere interi positivi; `dailydouble` accetta `yes` o `no`.
I contenuti testuali supportano formattazione HTML essenziale, ripulita con DOMPurify.

La demo si trova in `public/games/round_demo.json`. I percorsi multimediali
restano relativi alla radice del sito: per esempio `games/round_demo/meme/doge.jpg`.
Per aggiungere file multimediali, mettili in `public/games/` e indicane il percorso
nel JSON; l’importazione del JSON non carica gli allegati. Sono ammessi anche URL HTTP/HTTPS.

Partita e set di domande vengono salvati in `localStorage` sotto `esc-jeopardy.v2`.
Al primo avvio vengono recuperati automaticamente i vecchi dati AngularJS
(`ls.players`, `ls.game`, `ls.boardstatus`), se presenti sullo stesso indirizzo.
Le vecchie chiavi restano intatte. La cronologia di annullamento contiene fino
a 50 modifiche e dura fino al ricaricamento della pagina o al cambio del set.

## Compilazione e pubblicazione

```sh
npm run build
npm run preview
```

La build esegue il controllo dei tipi e produce il sito statico in `dist/`.
Pubblica il contenuto di questa cartella, anche su GitHub Pages: percorsi relativi
e navigazione hash permettono di usarlo in una sottocartella senza regole di riscrittura.
Le dipendenze sono bloccate nel lockfile. TypeScript è fissato alla serie 6,
compatibile con il `vue-tsc` utilizzato.

## Struttura

- `src/game.ts`: tipi, validazione JSON e regole di punteggio.
- `src/store.ts`: stato condiviso, salvataggi, migrazione e annullamento.
- `src/navigation.ts`: navigazione, compatibile con i vecchi link `#/answer/1/1`.
- `src/components/`: tabellone, giocatori, contenuti, musica e menu.
- `src/style.css`: CSS Grid/Flexbox e stile pixel.
- `public/`: domande, immagini, font e audio locali.

Licenza: GPL-2.0, come indicato in `LICENSE`.
