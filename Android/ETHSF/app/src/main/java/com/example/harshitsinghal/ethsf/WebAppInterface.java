package com.example.harshitsinghal.ethsf;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Iterator;
import java.util.Map;

public class WebAppInterface
{
    Context context ;



    public WebAppInterface(Context context)
    {
        this.context = context  ;
    }


    @JavascriptInterface
    public void sendNewShard(String json_string)
    {


        try
        {
            JSONObject json = new JSONObject(json_string);

            Iterator<String> iterator =  json.keys() ;

            if(iterator.hasNext())
            {
                String key = iterator.next() ;

                String value = json.getString(key) ;

                SharedPreferences.Editor editor = context.getSharedPreferences( "file.shard.key.user.no.user.web" , Context.MODE_PRIVATE).edit();

                editor.putString( key , value );

                editor.apply();

            }else
            {
                Toast.makeText(context , "Value Not Found" , Toast.LENGTH_LONG).show();
            }


        }
        catch (JSONException exception)
        {
            Toast.makeText(context , "Value Not Found" , Toast.LENGTH_LONG).show();
        }




    }



    @JavascriptInterface
    public String requestForShard(String key)
    {


        SharedPreferences sharedPreferences = context.getSharedPreferences("file.shard.key.user.no.user.web" , Context.MODE_PRIVATE) ;

        String result  = sharedPreferences.getString( key , null );


        return result ;

    }


}
