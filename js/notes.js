/**
 * Fichier : notes.js
 * @author : Julien Weisse
 * @author : Nael Boussetta
 */

"use strict";

/**
 * Note
 * @param {String} t titre
 * @param {String} c contenu
 * @constructor
 */
function Note(t, c){
    this.titre = t
    this.contenu = c
    this.dateNoteCreation = new Date()
    this.date_creation = this.dateNoteCreation.getDate() + "/" + this.dateNoteCreation.getMonth()+1 + "/" + this.dateNoteCreation.getFullYear()
    // methodes
    /** permet de changer le titre de la note */
    function setTitre(t) {this.titre = t}
    /** permet de changer le contenu de la note */
    function setContenu(c) {this.contenu = c}
}




/**
 * NoteList
 * gerer la liste de notes
 */
let noteList = {
    /** tableau des notes */
    listeNotes : [],
    // methodes
    /** permet d'ajouter une note au tableau */
    addNote(note) {
        return this.listeNotes.push(note)-1 // pour avoir element courant, la note
    },
    /** permet de retourner la note d'indice n */
    get(n) {return this.listeNotes[n]},
    /** permet de retourner la liste de note */
    getList() {return this.listeNotes},
    /** */
    save() {
        localStorage.removeItem('listNotes')
        localStorage.setItem('listeNotes', JSON.stringify(noteList.getList()))
    },
    /** */
    load() {
        let tempo = JSON.parse(localStorage.getItem('listeNotes'))
        if (tempo) noteList.listeNotes = tempo
    },
    /** */
    edit() {
        console.log('editer')
        noteFormView.display()
        let note = noteList.get(app.currentNoteIndex)
        note.titre = document.querySelector("#form_add_note_title").value
        note.contenu = document.querySelector("#form_add_note_text").value


        noteListView.displayItem(note)

        noteView.afficherNoteDansDOM(app.currentNoteIndex)
        noteFormView.hide() // rendre invisible le formulaire
        noteList.save()
        noteListView.selectItem(app.currentNoteIndex) // affichage note courante
    }
}




/**
 * NoteListView
 * gerer l affichage de la liste de notes dans la colonne
 */
let noteListView = {
  // methodes
  selectNote(event) {
      let elementSource = event.target

      let divChildren = document.getElementById('noteListView').children
      for (let i = 0; i < divChildren.length; i++) {
          divChildren[i].classList.remove("note_item-selected")
          if (divChildren[i] === elementSource){
              app.currentNoteIndex = i
              elementSource.classList.add("note_item-selected")
          }
      }
      noteListView.selectItem(app.currentNoteIndex)
      noteView.afficherNoteDansDOM(app.currentNoteIndex)
  },

  /** recoit une note et ajoute un item dans la liste affichee */
  displayItem(note) { // TODO affichage format date
      let text = `${note.titre}    (${note.date_creation})`
      let div = document.createElement('div')
      div.classList.add("note_item")
      div.appendChild(document.createTextNode(text))
      div.addEventListener("click",this.selectNote)
      document.getElementById('noteListView').appendChild(div)
  },

  selectItem(index) {
      let divChildren = document.getElementById('noteListView').children
      for (let i = 0; i < divChildren.length; i++) {
          divChildren[i].classList.remove("note_list_item-selected")
          if (i === index){
              divChildren[i].classList.add("note_list_item-selected")
          }
      }
  }
}




/**
 * NoteFormView
 * gere le formulaire de saisie d une note
 */
let noteFormView = {
    // methodes
    /** rend visible le formulaire en modifiant la liste de classes css */
    display() {
        document.getElementById('form_add_note_title').value = null
        document.getElementById('form_add_note_text').value = null
        document.querySelector('#noteForm').classList.remove('create_edit_note-hidden')

    },
    /** rend le formulaire caché en modifiant la liste de classes css */
    hide() {
        document.querySelector('#noteForm').classList.add('create_edit_note-hidden')
    },
    /** utilise comme handler de validation du formulaire : recupere les donnees saisies,
     * creee une note en utilisant le constructeur, affiche la note en utilisant l objet */
    validate() {
        console.log('valider')
        let titreNote = document.querySelector("#form_add_note_title").value
        let contenuNote = document.querySelector("#form_add_note_text").value
        let note = new Note(titreNote, contenuNote)


        app.currentNoteIndex = noteList.addNote(note) // ajout de la note dans la listeNotes + mises a jour de la note courante
        noteListView.displayItem(note)

        noteView.afficherNoteDansDOM(app.currentNoteIndex)
        noteList.save()
        noteListView.selectItem(app.currentNoteIndex) // affichage note courante
        noteFormView.hide()
    }
}





/**
 * NoteView
 * charge de gerer l affichage d une note
 */
let noteView = {
    // methodes
    /** conversion markdown en html */
    conversionMarkdownToHtml(note) {
        let date = note.date_creation
        let markdownText = `# ${note.titre.toUpperCase()}

[ ${date} ]

${note.contenu}`
        let conv = new showdown.Converter()
        return conv.makeHtml(markdownText)
    },
    /** methode pour afficher (en inserant dans le dom) la note courante convertie en html */
    afficherNoteDansDOM(index) {
        document.querySelector("#currentNoteView").innerHTML = this.conversionMarkdownToHtml(noteList.get(index))
    }
}




/**
 * MainMenuView
 * charge de gerer le menu general
 */
let mainMenuView = {
    // methodes
    /** utilisée pour traiter le click sur l'option "+" en affichant le formulaire de saisie */
    addHandler() {
        noteFormView.display()
    },
    /** initialise le menu en ajoutant les listeners sur les événements attendus */
    init() {
        // bouton '+'
        document.querySelector("#add").addEventListener('click', this.addHandler)
        // bouton 'valider'
        document.querySelector("#form_add_note_valid").addEventListener('click', noteFormView.validate)
        // bouton 'annuler'
        document.querySelector("#form_undo").addEventListener('click', noteFormView.hide)
        // bouton 'editer'
        //document.querySelector("#edit").addEventListener('click', noteList.edit)

        // chargement des notes si localstorage
        noteList.load()
        if (noteList.getList()) {
            noteList.getList().forEach((note, i) => {
                noteListView.displayItem(note, i)
            })
        }

    }
}




/**
 * Objet app pour sauvegarder l'état de l'application
 */
let app = {
    CurrentNote : null,
    currentNoteIndex: null,
    /** initialiser le menu dans un premier temps */
    init() {
        mainMenuView.init()
    }
}



// onload
window.onload = app.init;
