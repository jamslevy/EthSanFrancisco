package com.example.harshitsinghal.ethsf;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;

public class WebAppInterface
{
    Context context ;



    public WebAppInterface(Context context)
    {
        this.context = context  ;
    }


    @JavascriptInterface
    public void sendDataAndroid(String str)
    {
        Log.d("Data Received", "getData: " + str);
    }


}
