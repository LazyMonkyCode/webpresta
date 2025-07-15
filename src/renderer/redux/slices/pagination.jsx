import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    
    page:1,
    currentPage:1,
    totalPages:1,
    limitPerPage:5,
    totalItems:0,
    filter:null,
    limit:5
                
}


const paginationSlice = createSlice({
    name: 'pagination',
    initialState,
    reducers: {
        setPage:(state,action)=>{

            state.page  = action.payload
        },
        setTotalItems:(state,action)=>{
            state.totalItems = action.payload
        },
        setLimitPerPage:(state,action)=>{
            const {limitPerPage} = action.payload
            state.limitPerPage = limitPerPage
            state.totalPages = state.totalItems>limitPerPage ? Math.ceil(state.totalItems/limitPerPage):1
        },
       setPaginationData:(state,action)=>{

            const {page,limitPerPage,totalItems} = action.payload
            state.page=page
           // state.currentPage=action.payload.page
            state.limitPerPage=LimitPerPage
            state.totalItems = totalItems
            state.totalPages = totalItems>limitPerPage ? Math.ceil(limitPerPage/totalItems):1
        },
        resetPaginationData:(state,action)=>{
            state.page=1
            state.currentPage=1
            state.totalItems = action.payload.totalItems ? action.payload.totalItems  : state.totalItems
            state. totalPages= action.payload.totalPages ? action.payload.totalPages  :state.totalPages
            state.limitPerPage=action.payload.limitPerPage ? action.payload.limitPerPage  : state.limitPerPage
        },
        setFilter:(state,action)=>{
            state.filter = action.payload
        },
        resetFilter:(state,action)=>{
            state.filter = null
        },


    },
})



    export const { setPage,setPaginationData,setFilter,resetFilter,resetPaginationData,setTotalItems} = paginationSlice.actions;
export default  paginationSlice.reducer;