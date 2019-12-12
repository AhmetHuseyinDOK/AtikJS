class Atik{
    static createElement(tag, attributes,...children){
        return new RenderNode(new Element(tag,attributes,children));    
    }

    static createElementFromTemplate(temp ,props){
        return createElementFromTemplate(temp,props);
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

function createElementFromTemplate(temp , props){
    let node = document.createElement("div");
    node.innerHTML =  temp;
    return nodeToAtikElement(node.children[0],props); 
}

function nodeToAtikElement(node,props){
    
    let nodeName = node.localName;
    
    let attrObj = {};
    const evalReg = /{{[^}]*}}/g;
    
    if(node.nodeName == "#text"){
        return node.wholeText.replace(evalReg, (match) => {
            let exp = match.slice(2,-2);
            return eval(exp);
        });
    }

    let tag = nodeName.startsWith('a-') ? eval(nodeName.slice(2)) : nodeName ;
    
    let children = [];

    let aProps = [];

    for (const {name,value} of node.attributes) {

        let res = value.replace(evalReg, (match) => {
            let exp = match.slice(2,-2);
            return eval(exp);
        });

        if(name.startsWith('a-')){
            aProps.push({name,value})
        }else{
            attrObj[name] = res;    
        }

        
    } 

    for( const {name ,value} of aProps){
        
        switch(name){
            case 'a-show': 
                if(!eval(value))  return "";
                break;
            case 'a-list': 
                let [keyEv,listEv] = value.split("in");
                let list = eval(listEv);
                let key = keyEv.trim();
                let children = [];
                
                for (const item of list) {
                    
                    let itemChildren = [];
                    
                    for (const child of node.childNodes) {
                        let atikParam = nodeToAtikElement(child,{...props,[key]:item});
                        if(atikParam){
                            if(atikParam.length){
                                itemChildren.push(...atikParam)
                            }else{
                                itemChildren.push(atikParam)
                            }   
                        }
                    }
                    
                    children.push(Atik.createElement(tag,attrObj,...itemChildren))
                }
                    

                return children;
                break;
        }
    }
    
    
    
    for (const child of node.childNodes) {
            let atikParam = nodeToAtikElement(child,props);
            
            if(atikParam){
                if(atikParam.length){
                    children.push(...atikParam)
                }else{
                    children.push(atikParam)
                }   
            }
    }


    
    return Atik.createElement(tag,attrObj,...children);
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