import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {
  Firestore,
  collection,
  doc,
  collectionData,
  onSnapshot,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  firestore: Firestore = inject(Firestore);
  items$; //// entwickler nutzen dollar wenn die was observable ist ud wird damit gekennzeichnet
  items;
  unsubList;
  
  constructor() {
    this.unsubList = onSnapshot(this.getNotesRef(), (list) => {
      list.forEach((element) => {
        console.log(this.setNoteObject(element.data(), element.id));
      });
    }); /// onsnapshot brauch eine referenz und eine funktion

   
     

    // eine von lösungen zum echzeitdata abzurufen
    this.items$ = collectionData(this.getNotesRef());
    this.items = this.items$.subscribe((list) => {
      list.forEach((element) => {
        console.log(element);
      });
    });
    // das sollte man immer nutzen um beenden darauf zu hören oder die appcomp wird geschlossen
  }

  setNoteObject(obj: any, id:string): Note { /// mit diese funktion wird abgedeckt falls was in databank nicht existiert
    return {
      id: id,
      type: obj.type || "note",
      title: obj.title || "",
      content: obj.content || "",
      marked: obj.marked || false,

    }
  }

  ngOnDestroy(): void {
    this.items.unsubscribe(); /// hier wird es damit wieder unsubscribe
    
    this.unsubList();
  }

  getNotesRef() {
    return collection(this.firestore, 'notes'); // collection ist die samlung auf firebase
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  } // doc ist die untere ebene von collections also unterordner
}
