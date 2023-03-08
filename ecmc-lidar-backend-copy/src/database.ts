import mongoose from "mongoose";

const URL = 'mongodb://localhost:27017/ecmc_lidar';
mongoose.connect(URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }, (err: any) => {
        if (err)
                console.log(err.message);    
        else
                console.log("Successfully Connected!");           
});  
        
export default mongoose;
