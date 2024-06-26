import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {
  Firestore,
  collection,
  doc,
  collectionData,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  firestore: Firestore = inject(Firestore);
  // items$; //// entwickler nutzen dollar wenn die was observable ist ud wird damit gekennzeichnet
  // items;
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  unsubTrash;
  unsubNotes;

  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubTrash = this.subTrashList();
  }

  async deleteNote(colId: 'notes' | 'trash', docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log(err);
    });
  }

  async updateNote(note: Note) {
    // es wird nicht der komplete dokument überchrieben nur die positionen welche sich in item befinden
    if (note.id) {
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch((err) => {
        console.log(err);
      });
    }
  }

  getCleanJson(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };
  }

  getColIdFromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes';
    } else {
      return 'trash';
    }
  }

  async addNote(item: Note, colId: 'notes' | 'trash') {
    await addDoc(this.getNotesRef(colId), item)
      .catch((err) => {
        console.error(err);
      })
      .then((docRef) => {
        console.log('Document written with ID: ', docRef?.id);
      });
  }

  //   // eine von lösungen zum echzeitdata abzurufen
  //   this.items$ = collectionData(this.getNotesRef());
  //   this.items = this.items$.subscribe((list) => {
  //     list.forEach((element) => {
  //       console.log(element);
  //     });
  //   });
  //   // das sollte man immer nutzen um beenden darauf zu hören oder die appcomp wird geschlossen

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      /// onsnapshot brauch eine referenz und eine funktion
      this.trashNotes = [];
      list.forEach((element) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {
    return onSnapshot(this.getNotesRef('note'), (list) => {
      this.normalNotes = [];
      list.forEach((element) => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  setNoteObject(obj: any, id: string): Note {
    /// mit diese funktion wird abgedeckt falls was in databank nicht existiert
    return {
      id: id,
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false,
    };
  }

  ngOnDestroy(): void {
    // this.items.unsubscribe(); /// hier wird es damit wieder unsubscribe

    this.unsubTrash();
    this.unsubNotes();
  }

  getNotesRef(colId: string) {
    return collection(this.firestore, colId); // collection ist die sammlung auf firebase
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  } // doc ist die untere ebene von collections also unterordner
} for
