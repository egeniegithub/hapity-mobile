#import <UIKit/UIKit.h>

#import "AppDelegate.h"

#import "React/RCTBridgeModule.h"
@interface RCT_EXTERN_MODULE(LiveStream, NSObject)
RCT_EXPORT_METHOD(changeToNativeView) {
  dispatch_async(dispatch_get_main_queue(), ^(void) {
     AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
     [appDelegate goToNativeView];
  });
  
  
  
  
}
@end

int main(int argc, char * argv[]) {
  @autoreleasepool {
    return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
  }
}
