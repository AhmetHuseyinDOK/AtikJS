Atik.init({
    tasks: []
});

Atik.component('time' , {
    template: '<h6> {{props.tick}} </h6>',
    watch: ['tick']
});

function updateAtik(id){
    let item = Atik.hal.state.tasks[id]
    item.done = !item.done;
    Atik.hal.setState({tasks:Atik.hal.state.tasks});
}

Atik.component('todo_item',{
    template: `

        <span> {{props.todo.id}} => {{props.todo.name}} <button onclick="{{ () => updateAtik(props.todo.id)}}"> change </button> </span>
         
    `
});

Atik.component('done_list',{
    template: `
    <div>
        <h1>Done List</h1>
        <h3 a-show="{{props.tasks.length == 0}}">No item on the list</h3>
        <ul a-show="{{props.tasks.length != 0}}">
            <li  a-list="task in props.tasks.filter(({done}) => done)"><a-todo_item todo="{{props.task}}" /></li>
        </ul>
    </div>    
    `,
    watch: ["tasks"]
});

Atik.component('todo_list',{
    template: `
    <div>
        <h1>To Do List</h1>
        <h3 a-show="{{props.tasks.length == 0}}">No item on the list</h3>
        <ul a-show="{{props.tasks.length != 0}}">
            <li a-list="task in props.tasks.filter(({done}) => !done)"><a-todo_item todo="{{props.task}}" /></li>
        </ul>
    </div>    
    `,
    watch: ["tasks"]
});

Atik.component('main',{
    template: `
        <div>
            <input onchange={{props.onchange}}>
            <a-todo_list tasks="{{ Atik.hal.state.tasks }}"></a-todo_list>
            <a-done_list tasks="{{ Atik.hal.state.tasks }}"></a-done_list>
            <a-link to="#time" name="show me time" />
        </div>
   `
});

Atik.component('querycomp', {
    template: "<h3>{{props.query.get('name')}}</h3>"
})

setInterval( () => Atik.hal.setState({tick: new Date()}),500)

Atik.setRoutes({
    '': {
        component: main,
        props:  {
            tasks: Atik.hal.state.tasks,
            onchange: ({srcElement:{value}}) => {
                console.log(value);
                Atik.hal.setState({
                    tasks: [...Atik.hal.state.tasks , {id: Atik.hal.state.tasks.length , done:false , name: value}]
                })
            }
        }
    },
    '#time':{
        component: time,
        props: {
            tick: new Date()
        }    
    },
    '#q':{
        component: querycomp
    }
})

Atik.render( app );







