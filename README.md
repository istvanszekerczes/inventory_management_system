# Inventory Management System

Az első feladatot választottam, az-az egy egyoldalas raktárkezelő felületet fejlesztettem, amiben implementáltam egy konfliktus kezelő stratégiát.

## Fő funkciók

Az oldal betöltéskor listázza az összes termék adatait, amiket a szerver oldal tárol. Megjeleníti a termék nevét, képét az URL alapján, a mennyiségét és a legutolsó módosítás olvasható dátumát.

Lehetőséget biztosít a raktárkészleten tárolt termékek mennyiségének növelésére és csökkentésére léptetve.

A szerver 10 másodpercenként véletlenszerűen kiválaszt egy tárgyat, és ennek mennyiségét megváltoztatja pozitív vagy negatív irányba, majd frissíti a tárgyhoz tartozó Timestamp-et.

A kliens oldal optimista frissitést alkalmaz, tehát a felhasználói interakcióra egyből megváltozik a UI, majd a frissítést elküldi a szervernek, ami ellenőrzi, hogy ütközés történt-e. Ha ütközés történt, akkor elküldi a kliensnek válaszban a szerver oldali állapotát az adott terméknek. Ezután a felhasználónak el kell döntenie, hogy szeretné-e összefűzni a szerver oldali állapotot a változtatással, vagy a változtatást inkább elvétené, ilyenkor csak frissíti a UI-t a szerver oldali állapottal.

Előnyei:
 * Azonnali visszajelzést nyújt a felhasználónak, mivel a UI egyből frissül a művelet után.
 * A felhasználót bevonja az alkalmazás a döntésbe, két lehetőséget kínál amiből választani lehet.

Hátrányai:
 * Az alkalmazásom nem kezeli azt az esetet, ha a felhasználó ütközés miatt figyelmeztetést kap, és mire eldönti 
   mit szeretne tenni, a szerveren újabb változás történik.
 * Esetleges rossz felhasználó élményhez vezethet, ha folyamatosan ütközésbe kerül a frissítés nagy forgalom
   alatt, így folyton figyelmezetést kap a felhasználó.
