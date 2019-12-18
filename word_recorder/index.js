

Atik.init({
    words: new Map( JSON.parse(window.localStorage.getItem('words'))  || [])
})

Atik.component('word_list_item',{
    template: `<div onclick="() => window.location =  '#wordInfo' + '?id=' + props.word.id" class="word_list_item">{{props.word.word}}<br>{{props.word.meaning}}</div>`
});

Atik.component('word_list',{
    template: `
        <div class="word_list">
            <div a-list="word in [...props.words].map(arr => arr[1])">
                <a-word_list_item  word="{{props.word}}" ></a-word_list_item>
            </div>
        <div>
    `,
    watch: ["words"]
});

Atik.component('new_word_screen' ,{
    template: `
        <div class="new_word_screen">
            <div class="header"> New Word </div>
            <div class="body">
            <form >
                <input id=wordInp placeholder="Word" />
                <input id=meaningInp placeholder="Meaning" />
                <input id=exampleInp placeholder="Example" />
                <input id=exampleMeaningInp placeholder="Meaning of example"/>
            </form>
            </div>
            <div class="save" onclick="() => { addWord({word: wordInp.value , meaning: meaningInp.value , example:  exampleInp.value , exampleMeaning: exampleMeaningInp.value}); history.back(); }" > save </div>
        </div>
    `
})

Atik.component('word_edit_screen' ,{
    template: `
        <div class="new_word_screen">
            <div class="header"> {{ props.word.word }} </div>
            <div class="body">
            <form >
                <input id=wordInp placeholder="Word" value="{{props.word.word || ''}}" />
                <input id=meaningInp placeholder="Meaning" value="{{props.word.meaning || ''}}"/>
                <input id=exampleInp placeholder="Example" value="{{props.word.example || ''}}"/>
                <input id=exampleMeaningInp placeholder="Meaning of example" value="{{props.word.exampleMeaning || ''}}"/>
            </form>
            </div>
            <div class="save" onclick="() => { updateWord({id: props.word.id , word: wordInp.value , meaning: meaningInp.value , example:  exampleInp.value , exampleMeaning: exampleMeaningInp.value}); history.back(); }" > save </div>
        </div>
    `,
    mapper: ({query}) => ({word: Atik.hal.state.words.get(Number(query.get('id')))})
})

Atik.component('word_info_screen',{
    template: `
        <div class="word_info_screen">
            <div class="header"> {{props.word.word}} </div>
            <div class="body">
                <div class="label">Word</div>
                <div>{{props.word.word || "not specified" }}</div>
                <div class="label">Meaning</div>
                <div>{{props.word.meaning || "not specified" }}</div>
                <div class="label">Example</div>
                <div>{{props.word.example || "not specified"}}</div>
                <div class="label">Meaning of Example</div>
                <div>{{props.word.exampleMeaning || "not specified"}}</div>
                <div class="fab upper" onclick="{{ () => { window.location =  '#wordEdit' + '?id=' + props.query.get('id') } }}"> u </div>
                <div class="fab" onclick="() => { deleteWord(props.word.id); history.back(); }">-</div>
            </div>
        </div>
    `,
    mapper: ({query}) => ({word: Atik.hal.state.words.get(Number(query.get('id')))})
})

Atik.component('word_list_header',{
    template: `
        <div class="word_list_header">
            {{ props.size }} </br>
            <span>word you have learnt</span>
        </div>
    `,
    watch:["words"],
    mapper: ({words}) => ({size: words.size})
})

Atik.component('fab',{
    template: `
        <a class="fab" href="#newWord"> + </a>
    `
})

Atik.component('no_words',{
    template: `
        <div class="no_words"> No Words Added So Far :(</div>
    `
})

Atik.component('main_screen',{
    template: `
    <div>
        <a-word_list_header words="{{Atik.hal.state.words}}" ></a-word_list_header>
        <a-word_list a-show="{{ Atik.hal.state.words.size != 0 }}" words="{{Atik.hal.state.words}}" ></a-word_list>
        <a-no_words a-show="{{ Atik.hal.state.words.size == 0 }}" ></a-no_words>
        <a-fab></a-fab>
    </div>`
})

Atik.setRoutes({
    '': {
        component: main_screen
    },
    '#newWord':{
        component: new_word_screen
    },
    '#wordInfo':{
        component: word_info_screen
    },
    '#wordEdit':{
        component: word_edit_screen
    }
})

Atik.render(app);

class Word{
    constructor({word,meaning,example,exampleMeaning}){
        this.id = new Date().getTime()
        this.word =  word;
        this.meaning = meaning;
        this.example =  example;
        this.exampleMeaning =  exampleMeaning;
    }
}


function addWord({word , meaning,example,exampleMeaning}){
    let savedWord = new Word({word,meaning,exampleMeaning,example})
    let wordMap = new Map([...Atik.hal.state.words , [savedWord.id , savedWord]])
    Atik.hal.setState({words: wordMap})
}

function updateWord({id, word , meaning,example,exampleMeaning}){
    let savedWord = new Word({word,meaning,exampleMeaning,example})
    savedWord.id = id;
    Atik.hal.state.words.set(id , savedWord)
    Atik.hal.setState({words: Atik.hal.state.words})
}

function deleteWord(id){
    Atik.hal.state.words.delete(id);
    Atik.hal.setState({words: Atik.hal.state.words});
}

Atik.hal.bind(["words"], ({words}) => {
    let wordsJSON = JSON.stringify([...words]);
    window.localStorage.setItem('words',wordsJSON)
});