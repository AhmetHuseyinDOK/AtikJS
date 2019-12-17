let arr = [];
class Atik{


    /**
     * 
     * @param {*} name 
     * @param {object} parameters 
     * @param {Function} mapper
     */
    static component(name,{template ,watch , mapper }){
        let fun  = (props) => {
            if(mapper){
                props = {...props ,  ...mapper(props)};
            }
            let elem =  Atik.createElementFromTemplate(template,props);
            elem.watch = watch;
            
            return elem;
        }

        window[name] = fun;
        
    }

    /**
     * 
     * @param {*} tag 
     * @param {*} attributes 
     * @param  {...any} children 
     * @returns {Element} renderNode
     */
    static createElement(tag, attributes,...children){
        return new Element(tag,attributes,children);    
    }

    /**
     * 
     * @param {*} temp 
     * @param {*} props
     * @returns {RenderNode} renderNode
     */

    static createElementFromTemplate(temp ,props){
        return createElementFromTemplate(temp,props);
    }

    /**
     * 
     * @param {object} props 
     */
    static init(props){
        Atik.hal = new Hal(props);
    }

    static setRoutes(routes){
        Atik.routes = routes;
    }

    static renderRoute(routeString){ 
        
        let routeName = routeString
        let queryString = ""
        let indexOfQuestionMark = routeString.indexOf('?');
        if(indexOfQuestionMark != -1){
            routeName = routeString.slice(0, -1 * (routeString.length - indexOfQuestionMark))
            queryString = routeString.slice(indexOfQuestionMark);
        }
        
        
        let route = Atik.routes[routeName];
        
        if(route){
            route.props = route.props || {};
            route.props.query = new URLSearchParams(queryString);
            Atik.element  = Atik.createElement(route.component , route.props );
        }else{
            Atik.element = Atik.createElement(notfound,{});
        }

        Atik.root = new RenderNode().render(Atik.element);
        
    }

    /**
     * 
     * @param {Function} component 
     * @param {HTMLElement} elem 
     * @param {props } object 
     */
    static render(elem ){

        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }

        Atik.renderRoute(window.location.hash)
        
        elem.appendChild(Atik.root);
        
        window.onhashchange = function(event) {
            
            Atik.render(elem);
        };

    }

}

Atik.component('notfound',{
    template: '<h4>Not Found</h4>'
})


class Memoize{

    static init(){
        Memoize.map = new Map();
    }

    static remember(argObj){
        argObj = JSON.stringify(argObj);
        let res = Memoize.map.get(argObj);
        return res;
    }

    static memoize(argumentObj , result){

        argumentObj =  JSON.stringify(argumentObj);
        
        let args = Memoize.map.get(argumentObj);
        
        if(!args){
            Memoize.map.set(argumentObj , result);
        }
        
        return result;
    
    }



}

Memoize.init();

class Element{
    constructor(tag , attributes,children){
        this.tag =  tag;
        this.attributes = attributes;
        this.children =  children;
    }
}

let i = 0;
let htmlNodes = [];
let nodes = [];
class RenderNode{

    /**
     * 
     * @param {Element} elem 
     */
    constructor(){
        this.$_htmlNode;
        nodes.push(this);
    }   


    /**
     * 
     * @param {Element} elem 
     */
    render(elem ){
        

        //if not mounted which means the first render
        if(!this.htmlNode){
            
            //every component indeed is a function so we check it
            if(typeof elem.tag == "function"){
                //get the element from Component
                let atikElem = elem.tag(elem.attributes);
                //open up a new render node to hold htmlNode
                this.htmlNode = new RenderNode().render(atikElem); 
                //for further renders render directly from here
                if(atikElem.watch){
                    //below function will trigger whenever specified state updated    
                    Atik.hal.bind(atikElem.watch , (state) => {
                        //add state to attributes
                        // should i give the state seperately  ?
                        let aElem = elem.tag({...elem.attributes,...state});
                        //create a new render node 
                        let node = new RenderNode().render(aElem);
                        this.htmlNode.innerHTML = "";
                        //update the old htmlNode
                        this.htmlNode.appendChild(node);
                    });
                }

                return  this.htmlNode;
            }else{
                //if it is a regular html tag just render it
                this.htmlNode = document.createElement(elem.tag);
            }  
            
        }
        
        //assign attributes
        if(elem.attributes){
            Object.assign(this.htmlNode,elem.attributes)  
        }
        
        //clear child
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }

        for (const child of elem.children) {
              
            //checks if a render node or just a string
            if(typeof child == "string"){
                this.htmlNode.appendChild(document.createTextNode(child));    
            }else{
                this.htmlNode.appendChild( new RenderNode().render(child));
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

    if(node.className){
        attrObj.className =  node.className;
    }

    const evalReg = /{{[^}]*}}/g;
    
    if(node.nodeName == "#text"){
        return node.wholeText.replace(evalReg, (match) => {
            let exp = match.slice(2,-2);
        
            return eval(exp);
        });
    }
    //check if it is a AtikComponent or regular HTML Tag
    let tag = nodeName.startsWith('a-') ? eval(nodeName.slice(2)) : nodeName ;
    
    let children = [];
    
    //this is going to hold Atik Specific Attributes
    let aProps = new Map();

    for (const {name,value} of node.attributes) {
        
        let res;
        
        //evaluates the value
        //if it starts with on that means it is a function
        if(name.startsWith('on') ){
            //so evaluate the function
            res = eval(value);
        }else if(value.startsWith('{{')){
            // if it is form {{ }} , we need to evaluate it 
            res = eval(value.slice(2 , -2))
        }else{
            //if it is just a string just replace the values after evaluation
            res = value.replace(evalReg, (match) => {
                let exp = match.slice(2,-2);
                return eval(exp);
            });
        }
        
        //if it is an Atik component
        if(name.startsWith('a-')){
            aProps.set(name,res)
        //if it just an html Element   
        }else{
            
            attrObj[name] = res;    
        }

        
    } 

    // check for a-show do nothing further if the value false
    if(aProps.has('a-show')){
        let val= aProps.get('a-show');
        if(!val)  return "";
    }

    for( const [name ,value] of aProps){
        switch(name){
            case 'a-list': 
                let [keyEv,listEv] = value.split("in");
                //console.log(props);
                let list = eval(listEv);
                let key = keyEv.trim();
                let children = [];
                //console.log(list);
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
                    
                if(children.length == 0){
                    return "";
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


    //console.log(attrObj)
    return Atik.createElement(tag,attrObj,...children);
}

class Hal{

    constructor(state = {}){
        this.state = state
        this.bindings = {}
        for(const key of Object.keys(state)){
            if(!this.bindings[key]){
                this.bindings[key] = [];
            }
        }
    }

    setState(state){
        this.state = {...this.state , ...state};
        this.notify(Object.keys(state),this.state);
    }

    bind(keys, func){
        
        for(const key of keys){
            if(!this.bindings[key]){
                this.bindings[key] = [];
            }
        }
       
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

Atik.component('link',{
    template: `<a onclick="{{(e) => {e.preventDefault();  window.location.hash =  props.to } }}">{{props.name}}</a>`
});