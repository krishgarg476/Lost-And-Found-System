import { createAsyncThunk,createSlice, isRejectedWithValue } from "@reduxjs/toolkit";
import api from '../services/api';

// Thunk to fetch profile + items from backend
export const fetchProfile=createAsyncThunk(
    'auth/fetchProfile',
    async(_,{rejectWithValue})=>{
        try{
            const [userRes,lostRes,foundRes]=await Promise.all([
                api.get('/user/me'),
                api.get('/lost-items/user/me'),
                api.get('/found-items/mine')
            ]);
            return {
                user:userRes.data.user,
                userItems:{
                    lost:lostRes.data.items,
                    found:foundRes.data.items
                }
            }
        }catch(err)
        {
            return rejectWithValue(err.response?.data.message||err.message);
        }
    }
);

const authSlice=createSlice({
    name:'auth',
    initialState:{
        user:null,
        userItems:{lost:[],found:[]},
        loading:false,
        error:null
    },
    reducers:{
        logout(state){
            state.user=null
            state.userItems = { lost: [], found: [] }
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(fetchProfile.pending,(state)=>{
            state.loading=true;
        })
    .addCase(fetchProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.userItems = action.payload.userItems;
    })
    .addCase(fetchProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    }
})

export const { logout } = authSlice.actions
export default authSlice.reducer