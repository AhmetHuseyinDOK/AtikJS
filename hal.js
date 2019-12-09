class Hal{

    constructor({elem}){
        this.root = elem;
        this.$_html = this.root.innerHTML;
        this.$_state = {};
        this.components = new Map();
        this.state = new Proxy(this.$_state,this.$_stateHandler());
    }

    component(name,{template}){
        this.components.set(name,{template});
    }

    initState(obj){
        for(let key in obj){
            window[key] = obj[key];
        }
        this.$_renderHTML(this.$_html);
    }

    $_stateHandler(){
        let that = this;
        return {
            set: function(obj, prop, value) {
                window[prop] = value;
                obj[prop] = value;
                that.$_renderHTML(that.$_html);
            }
        }
    }

    $_renderHTML(html){
        let componentReg = /<[^\/]*\>.*<\/[^\>]*>/g;

        let propReg =  / [^=]*="[^"]*"/g;
        
        let componentCompiled  = html.replace(componentReg, (match) => {
            console.log(match);
            let [componentKey ,...props] = match.slice(1,-2);
            console.log(componentKey);
            let component = this.components.get(componentKey);
            if(component){
                return component.template;
            }
            return match;
        });


        let reg = /\${[^}]*}/g;
        
        let res = componentCompiled.replace(reg,(match) => {
            let val = match.slice(2,-1);
            let compiled;
            compiled = eval(val);
            return compiled;
        });
        
        this.root.innerHTML = res;
    }
}