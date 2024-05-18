//inorder to make this a client side component write "use Client" in the first line

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Dashboard = async() => {
    const {getUser}=getKindeServerSession()
    //need to await the getUser function as its returning a promise
    const user=await getUser()

    if(!user || !user?.id){
        //add origin to the query string to redirect back to the dashboard after login
        redirect('/auth-callback?origin=dashbaord')
    }

    return (
        <div>
            <h1>{user?.email??'Loading...'}</h1>
        </div>
    );
}

export default Dashboard;