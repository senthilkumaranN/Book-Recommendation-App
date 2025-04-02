import { configureStore } from "@reduxjs/toolkit";
import authreducer from '../Slice/AuthSlice'
import bookreducer from  '../Slice/BookSlice'

const store = configureStore({
     
    reducer:{
        auth: authreducer,
        books: bookreducer
    }
});


export default store;
