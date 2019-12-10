


function todo(attributes){
    const {todo} = attributes; 
    return Atik.createElement(
        'li',
        null,
        Atik.createElement(
           checkbox,
           {
               onchange: attributes.onclick,
               checked:todo.done 
           },
        ),
        Atik.createElement(
            'div',
            {
                style:"display:inline"
            },
            todo.name
        )
        
    )
}

function checkbox(attributes){
    const {checked, onchange} = attributes;
    
    const inside = checked ? 

    Atik.createElement(
        'span',
        null,
        'x'
    ) : "";

    return Atik.createElement(
        'span',
        {
            className:"checkbox",
            onclick:onchange
            
        },
        inside
    )
    
}

function todoList(attributes){
    const {list} = attributes;
    return Atik.createElement(
        'ul',
        null,
        ...list.map((t,index) => todo({todo:t,onclick:() => updateTodo(t.index)}))
    )
}

function main(attributes){
    return Atik.createElement(
        'div',
        {
            className:"main",
        },
        Atik.createElement( 
            'input',
            {
                onchange: ({srcElement:{value}}) => attributes.onchange(value)
            }
        ),
        Atik.createElement(
            'h1',
            null,
            "Will Do List"
        ),
        willDoList,
        Atik.createElement(
            'h1',
            null,
            "Done List"
        ),
        doneList
    )
}