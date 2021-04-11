# AtikJS
A hobby project to dynamically render html with a data driven approach featuring build in hash routing

## How to include to a project

Download and reference to this url at the top of your html file

```
https://raw.githubusercontent.com/AhmetHuseyinDOK/AtikJS/master/hal.js
```

## Initiating state

```
Atik.init({
  tavsiyeler: ["yazılım öğren :)"], // You can set the initial global state in here 
});
```

## Registering components

```
Atik.component("header", {
  template: ` 
    <h1>Tavsiyeler</h1>
    `,
});
```

## Accessing global state

Global state can be accessed through any component by simply `props.nameOfKey`

```
Atik.component("header", {
  template: `
    <h1>Tavsiyeler ({{props.tavsiyeler.length}})</h1>
    `,
   watch: ["tavsiyeler"] 
});
```

## Using mapper
```
Atik.component("header", {
  template: `
    <h1>Tavsiyeler ({{props.size}})</h1>
    `,
  watch: ["tavsiyeler"],
  mapper: ({ words }) => ({
    size: tavsiyeler.length,
  }),
});
```
## Sending and accessing props

```
Atik.component("tavsiye_list", {
  template: `
    <ul>
          <div a-list="tavsiye in props.tavsiyeler" >
            <a-list_item tavsiye="{{props.tavsiye}}"></a-list-item> // send the prop simply adding property to the caller tag
          </div>
       </ul>
    `,
  watch: ["words"],
});

Atik.component("list_item", {
  template: `
    <li>{{props.tavsiye}}</li> // access via props.word
   `,
});
```

## Using other components

All components are global, So you can access every component from any components. Simply add `a-` to beginning of the component name

```

Atik.component("main", {
  template: `
    <div>
      <a-header></a-header>
       <a-add_word></a-add_word>
       <a-word_list></a-word_list>
    </div>
    `,
});

```

## Conditional Rendering

```
Atik.component("tavsiyeler_list", {
  template: `
    <ul>
         <div a-show="{{props.tavsiyeler.length === 0}}">
              No Item Found
          </div>
          <div a-show="{{props.tavsiyeler.length > 0}}" a-list="tavsiye in props.tavsiyeler" >
            <a-list_item word="{{props.tavsiyeler}}"></a-list-item>
          </div>
          
       </ul>
    `,
  watch: ["tavsiyeler"],
});
```

## Iterating over lists

Current iteration can be accessed through via `props.iterationName`

```
Atik.component("tavsiyeler_list", {
  template: `
    <ul>
          <div a-list="tavsiye in props.tavsiyeler" >
            <a-list_item word="{{props.tavsiyeler}}"></a-list-item>
          </div>
          
       </ul>
    `,
  watch: ["tavsiyeler"],
});
```

## Setting Routes

Atik provides a built in hash routing. Components can be diretly accessed via their names since they are already registered to window object.

```
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
```

## Start rendering

```
Atik.render(document.getElementById("app"));
```

