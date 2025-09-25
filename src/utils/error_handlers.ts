
const error_handlers = (params:unknown) => {
    try {
        return params;
    } catch (error: any) {
        console.log(error.message,"\n",error.stack);
    }
}

