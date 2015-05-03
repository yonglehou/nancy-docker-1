namespace Nancy.Demo.Hosting.Docker
{
    using System;
    using System.Diagnostics;

    using Nancy.Hosting.Self;

    class Program
    {
        static void Main()
        {
            var uri = new Uri("http://localhost:8080");
            var nancyHost = new NancyHost(uri);
            nancyHost.Start();

            Console.WriteLine("Nancy now listening on " + uri.AbsoluteUri);

            var line = Console.ReadLine();
            while(line != "quit") {
              line = Console.ReadLine();
            }
        }
    }
}
