let arr = [];
class Atik{


    /**
     * 
     * @param {*} name 
     * @param {object} parameters 
     */
    static component(name,{template ,watch }){
        let fun  = (props) => {
            let elem =  Atik.createElementFromTemplate(template,props);
            elem.watch = watch;
            
            return elem;
        }

        window[name] = new Proxy(fun,{
            apply: (target , thisArg , argArr) => {
                
                let res =  target(...argArr);
                arr.push(res);
                return res;
            }
        });
        
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
class RenderNode{

    /**
     * 
     * @param {Element} elem 
     */
    constructor(){
        this.$_htmlNode;
    }   


    

    //refactor it or die!!!
    render(elem ){
        

        //if not mounted which means the first render
        if(!this.htmlNode){
            
            // let memory = Memoize.remember(elem);
            // if(memory){
            //     this.htmlNode =  memory.cloneNode(true);
            //     htmlNodes.push(this.htmlNode)
            //     return this.htmlNode;
            // }
            
            if(typeof elem.tag == "function"){
                let atikElem = elem.tag(elem.attributes);
                this.htmlNode = new RenderNode().render(atikElem); 
                this.renderFunction = elem.tag;
                
                if(atikElem.watch){    
                    Atik.hal.bind(atikElem.watch , (state) => {
                        let aElem = elem.tag({...elem.attributes,...state});
                        let node = new RenderNode().render(aElem);
                        this.htmlNode.innerHTML = "";
                        this.htmlNode.appendChild(node);
                    });
                }

                htmlNodes.push(this.htmlNode)
                return Memoize.memoize(elem , this.htmlNode);
            }else{
                this.htmlNode = document.createElement(elem.tag,elem.attributes);
            }  
        }

        // console.log(++i);

        //check if a Atik Component
        if(this.renderFunction){
            this.htmlNode.innerHTML = "";
            this.htmlNode.appendChild(new RenderNode().render(this.renderFunction(elem.attributes)));
            return Memoize.memoize(arguments , this.htmlNode);
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
        
        return Memoize.memoize(elem , this.htmlNode);

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

    let tag = nodeName.startsWith('a-') ? eval(nodeName.slice(2)) : nodeName ;
    
    let children = [];
    
    let aProps = new Map();

    for (const {name,value} of node.attributes) {
        
        let res;
        //console.log(name);
        //dangerous
        if(name.startsWith('on') ){
            res = eval(value);
        }else if(value.startsWith('{{')){
            res = eval(value.slice(2 , -2))
        }else{
            res = value.replace(evalReg, (match) => {
                let exp = match.slice(2,-2);
                return eval(exp);
            });
        }
        
        

        if(name.startsWith('a-')){
            aProps.set(name,value)
        }else{
            
            attrObj[name] = res;    
        }

        
    } 

    if(aProps.has('a-show')){
        let val= aProps.get('a-show');
        if(!eval(val))  return "";
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