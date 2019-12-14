const hal = new Hal({
    name: "dnemasd"
});

Atik.component('asd',{
    template: '<h1>{{props.name}}<h1>'
});

Atik.component('main',{
    template: `
        <div>
            <input onchange={{props.onchange}}>
            <a-asd name={{props.name}}></a-asd>
        </div>
   `
});

new Atik(
    main , 
    app,
    {
        props: {
            name: hal.state.name ,
            onchange: ({srcElement:{value}}) =>  hal.setState({name:value})
        }
    }
);


hal.bind(['name'] , ({name}) => elem.render({name , onchange: ({srcElement:{value}}) =>  hal.setState({name:value})}))
hal.bind(['name'], console.log)


