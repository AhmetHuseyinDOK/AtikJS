class Atik{
    static createElement(tag, attributes,...children){
        return new RenderNode(new Element(tag,attributes,children));    
    }

    static render(renderNode , elem){
        elem.innerHTML = ""
        elem.appendChild(renderNode.render());
    }

}



class Element{
    constructor(tag , attributes,children){
        this.tag =  tag;
        this.attributes = attributes;
        this.children =  children;
    }
}

class RenderNode{

    constructor(elem){
        this.elem = elem;
        this.htmlNode; 
    }   

    appendChild(child){
        this.children.push(child);
    }
    
    //refactor it or die!!!
    render(attributes = this.elem.attributes, children = this.elem.children){
        
        if(this.elem.attributes == attributes && this.elem.children == children  && this.htmlNode != null){
            return this.htmlNode;
        }

        this.elem.attributes =  attributes;
        this.elem.children = children;
        
        //just in first render
        if(!this.htmlNode){
            if(typeof this.elem.tag == "function"){
                let res = this.elem.tag(this.elem.attributes);
                this.htmlNode = res.render(); 
                this.renderFunction = this.elem.tag;
                return this.htmlNode;
            }else{
                this.htmlNode = document.createElement(this.elem.tag,this.elem.attributes);
            }  
        }

        //check if a Atik Component
        if(this.renderFunction){
            this.htmlNode.innerHTML = "";
            this.htmlNode.appendChild(this.renderFunction(this.elem.attributes).render());
            return this.htmlNode;
        }

        //assign attributes
        if(this.elem.attributes){
            
            Object.assign(this.htmlNode,this.elem.attributes)  
        }

        //clear child
        this.htmlNode.innerHTML = "";
        
        for (const child of this.elem.children) {
            //checks if a render object or just a string
            if(typeof child == "string"){
                this.htmlNode.appendChild(document.createTextNode(child));    
            }else{
                this.htmlNode.appendChild(child.render());
            }
        }
            
        return this.htmlNode;

    }

    

}

class Hal{

    constructor(state = {}){
        this.state = state
        this.bindings = {}
        for(const key of Object.keys(state)){
            this.bindings[key] = [];
        }
    }

    setState(state){
        this.state = {...this.state , ...state};
        this.notify(Object.keys(state),this.state);
    }

    bind(keys, func){
        for (const key of keys) {
            this.bindings[key].push(func);    
        }
    }

    notify(keys,state){
        let funcs = new Set();
        
        for (const key of keys) {
            for (const func of this.bindings[key]) {
                funcs.add(func);   
            }
        }

        for (const func of funcs) {
            func(state);
        }
    }

}